var ctsol = window.ctsol || {};
ctsol.ID = GetUrlKeyValue("ID");
ctsol.config = {
    // Configure internal list name
    listName: "CustomList",

    // Configure internal document library name
    libName: "DocumentLibrary"
}
ctsol.LookupValue = +new Date();

ctsol.CustomizeFieldRendering = function () {

    var options = {};
    options.Templates = {};
    options.Templates.Fields = {
        // Change to unique list column
        "LinkTitle": {
            "View": ctsol.LinkToDispForm,
            "DisplayForm": ctsol.LinkToDispForm,
        },
        "LinkTitleNoMenu": {
            "View": ctsol.LinkToDispForm,
            "DisplayForm": ctsol.LinkToDispForm,
        },
        "Title": {
            "View": ctsol.LinkToDispForm,
            "DisplayForm": ctsol.LinkToDispForm,
        },
        "ctsolLookup": {
            "NewForm": ctsol.AutofillLookupValue,
            "DisplayForm": ctsol.HideField,
            "EditForm": ctsol.HideField
        }
    };
    options.Templates.OnPreRender = ctsol.OnPreRender;
    options.Templates.OnPostRender = ctsol.OnPostRender;

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(options);

}

ctsol.OnPreRender = function(ctx){
    if (!ctsol.ctx){
        ctsol.ctx = ctx;
    }
}

// Save LookupValue into LookupColumn and hide that field
ctsol.AutofillLookupValue = function(ctx){
    var formCtx = SPClientTemplates.Utility.GetFormContextForCurrentField(ctx);
    formCtx.registerGetValueCallback(formCtx.fieldName, function () {

        return ctsol.LookupValue;
    });


    return ctsol.HideField(ctx);
}

// Read Only Field
ctsol.ReadOnlyField = function(ctx){
    return SPField_FormDisplay_Default(ctx);
}

// Hide Fields
ctsol.HideField = function (ctx) {
    return "<span class='ctsolHiddenField'></span>";
}

// Build link to Dispform and show only corresponding folder of DocumentLibrary
ctsol.LinkToDispForm = function(ctx){
    var id = ctx.CurrentItem.ID;
    if (!id){
        id = ctsol.ID;
    }

    ctsol.rootFolder = _spPageContextInfo.webServerRelativeUrl + "/" + ctsol.config.libName + "/" + ctx.CurrentItem.ctsolLookup;
    ctsol.url = _spPageContextInfo.webAbsoluteUrl + "/Lists/" + ctsol.config.listName + "/DispForm.aspx?ID=" + id + "&RootFolder=" + ctsol.rootFolder;

    return "<a href='" + ctsol.url + "'>" + ctx.CurrentItem.Title + "</a>";
}


// Adjust Document WebPart Title Link
ctsol.AdjustDocLibWPUrls = function(){
    if (ctsol.ctx.BaseViewID === "DisplayForm"){
        // Documents Title should link back to root
        jQuery(".ms-webpart-titleText").find("a").attr("href", ctsol.url);
    }
}

ctsol.OnPostRender = function(ctx) {

    if (ctx.BaseViewID !== 1){
        jQuery(".ctsolHiddenField").closest("tr").hide();
    }
}

// Function to create folder in DocumentLibrary
ctsol.CreateFolder = function(){
    var dfd = jQuery.Deferred();

    jQuery.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/lists/" + ctsol.config.libName + "/rootfolder/folders/add(url='" + ctsol.LookupValue + "')",
        type: "POST",
        contentType: 'application/json;odata=verbose',
        headers: { 
            "accept": "application/json; odata=verbose", 
            "content-type": "application/json; odata=verbose",
            "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
        },
        success: function(data){
            dfd.resolve(data);
        },
        error: function(data){
            dfd.reject(data);
        }
    });

    return dfd.promise();
    
}

ctsol.CustomPreSaveAction = function(){
    if (ctsol.ctx.BaseViewID === "NewForm"){
        jQuery.when(ctsol.CreateFolder()).always(function (data){
           jQuery("input[value='Save']:last").click();
        });
    } else {
        jQuery("input[value='Save']:last").click();
    }
}

ctsol.OnPostRenderOnce = function(){
    ctsol.AdjustDocLibWPUrls();

    // Hide original Save button and place custom save button
    jQuery("input[value='Save']").hide();
    jQuery("<input type='button' value='New Save' class='ms-ButtonHeightWidth' onClick='ctsol.CustomPreSaveAction();' >")
        .insertBefore("input[value='Save']:last");
}

// Execute JS Link Functionality
ctsol.CustomizeFieldRendering();

_spBodyOnLoadFunctionNames.push("ctsol.OnPostRenderOnce");