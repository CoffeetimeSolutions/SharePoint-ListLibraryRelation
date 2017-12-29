var ctsol = window.ctsol || {};
ctsol.ID = GetUrlKeyValue("ID");
ctsol.config = {
    // Configure internal list name
    listName: "CustomList",

    // Configure internal document library name
    libName: "DocumentLibrary"
}

ctsol.CustomizeFieldRenderingDocs = function () {

    var options = {};
    options.Templates = {};
    options.Templates.Fields = {
        "LinkFilename": {
            // "View": RenderFieldValueDefault
            "View": ctsol.LinkToDocLibDispForm
        }
    };
    // options.Templates.OnPreRender = ctsol.OnPreRender;
    options.Templates.OnPostRender = ctsol.OnPostRender;

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(options);

}

// Build link to Dispform and show only corresponding Folder of DocLib
ctsol.LinkToDocLibDispForm = function(ctx){
    if (!IsNullOrUndefined(ctx.CurrentItem.File_x0020_Type)){
        if (!ctx.CurrentItem.File_x0020_Type.length){
            var url = _spPageContextInfo.webAbsoluteUrl + "/Lists/" + ctsol.config.listName + "/DispForm.aspx?ID=" + ctsol.ID + "&RootFolder=" + ctx.CurrentItem.FileRef;
            return "<a href='" + url + "'>" + ctx.CurrentItem.FileLeafRef + "</a>";
        }
    }

    // return RenderFieldValueDefault(ctx);
    return "<a href='" + ctx.CurrentItem.FileRef + "'>" + ctx.CurrentItem.FileLeafRef + "</a>";
}

// Execute JS Link Functionality
ctsol.CustomizeFieldRenderingDocs();
