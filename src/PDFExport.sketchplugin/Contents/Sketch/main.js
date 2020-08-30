
//-------------------------------------------------------------------------------------------------------------
// Utilities
//-------------------------------------------------------------------------------------------------------------

function pageToPDF(page) {
	var pageArray = [page];
	MSPDFBookExporter.exportPages_defaultFilename(pageArray, page.name() + ".pdf");
}

//-------------------------------------------------------------------------------------------------------------
// Export current page to PDF
//-------------------------------------------------------------------------------------------------------------


function currentPageToPDF(context) {
	pageToPDF(context.document.currentPage());
}


//-------------------------------------------------------------------------------------------------------------
// Export only selected artboards to PDF
//-------------------------------------------------------------------------------------------------------------


function artboardsToPDF(context) {
	
	var doc = context.document;
	var pages = doc.pages();
	var selectedLayers = NSArray.array();
	
	for (var i = 0; i < pages.length; i++) {
		var selectedLayersInPage = pages[i].selectedLayers().layers();
		var numLayers = selectedLayersInPage.length;
		
		if (numLayers > 0) {
			selectedLayers = selectedLayers.arrayByAddingObjectsFromArray(selectedLayersInPage);
		}
	}
	
	var selection = selectedLayers
	
	// Check for artboards in selection
	
	var selectionContainsArtboards = false;
	
	for (var i = 0; i < selection.length; i++) {
		if (selection[i].isMemberOfClass(MSArtboardGroup)) {
			selectionContainsArtboards = true;
		}
	}
	if (!selectionContainsArtboards) {
		NSApp.displayDialog("No artboards selected!");
		return;
	}
	

	// Create temporary page to house selected artboards
	
	var tempPage = MSPage.new();
	doc.documentData().addPage(tempPage);
	tempPage.setName("PDF Export");
	tempPage.addLayers(selection);
	

	// Remove hidden layers
	
	var tempLayers = tempPage.children()
	for (var i = 0; i < tempLayers.length; i++) {
		var layer = tempLayers[i];
		if (layer.isVisible() == 0) {
			layer.removeFromParent();
		}
	}
	
	// Detach symbols to prevent display bug
	
	var pageChildren = tempPage.children();
	for (var i = 0; i < pageChildren.length; i++) {
		var layer = pageChildren[i];
		if (layer.isMemberOfClass(MSSymbolInstance)) {
			findAndDetachFromSymbol(layer);
		}
	}
	
	function findAndDetachFromSymbol(layer) {
		if (layer.isMemberOfClass(MSSymbolInstance)) {
			var group = layer.detachByReplacingWithGroup();
			var children = group.children();
			for (var i = 0; i < children.length; i++) {
				findAndDetachFromSymbol(children[i]);
			}
		}
	}
	
	// Export temporary page, then remove it from document
	
	pageToPDF(tempPage);
	tempPage.removeFromParent();
	doc.documentData().removePage(tempPage);

	// Clear selected layers
	
	//doc.document.selection.clear();
	//doc.document.selected.clear();
	//selection.clear();
	//selectedLayers.clear();

}
