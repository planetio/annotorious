goog.provide('yuma.ImageAnnotator');

goog.require('goog.soy');
goog.require('goog.dom');
goog.require('goog.dom.query');
goog.require('goog.events');
goog.require('goog.math');
goog.require('goog.style');

goog.require('yuma.events');
goog.require('yuma.selection.DragSelector');

yuma.ImageAnnotator = function(id) {
  var image = goog.dom.getElement(id);

  var annotationLayer = goog.dom.createDom('div', 'yuma-annotationlayer');
  goog.style.setStyle(annotationLayer, 'position', 'absolute');
  goog.style.setPosition(annotationLayer , goog.style.getPosition(image));

  var hint = goog.soy.renderAsElement(yuma.templates.hint, {msg:'Click and Drag to Annotate'});
  goog.style.setOpacity(hint, 0); 
  goog.dom.appendChild(annotationLayer, hint);

  var viewCanvas = goog.soy.renderAsElement(yuma.templates.canvas, {width:image.width, height:image.height});
  goog.dom.appendChild(annotationLayer, viewCanvas);

  var editCanvas = goog.soy.renderAsElement(yuma.templates.canvas, {width:image.width, height:image.height});
  goog.style.setStyle(editCanvas, 'pointer-events', 'none'); 
  goog.dom.appendChild(annotationLayer, editCanvas);  
  
  goog.events.listen(annotationLayer, goog.events.EventType.MOUSEOVER, function() { 
    goog.style.setOpacity(viewCanvas, 1.0); 
    goog.style.setOpacity(hint, 0.8); 
  });

  goog.events.listen(annotationLayer, goog.events.EventType.MOUSEOUT, function() { 
    goog.style.setOpacity(viewCanvas, 0.4); 
    goog.style.setOpacity(hint, 0);
  });

  goog.dom.appendChild(document.body, annotationLayer);

  var viewer = new yuma.Viewer(viewCanvas);

  var selector = new yuma.selection.DragSelector(editCanvas);
  goog.events.listen(annotationLayer, goog.events.EventType.MOUSEDOWN, function(event) { 
    selector.startSelection(event.offsetX, event.offsetY);
    goog.style.setStyle(editCanvas, 'pointer-events', 'auto'); 
  });

  // Lifecycle control
  var eventBroker = yuma.events.EventBroker.getInstance();
  var dummyCounter = 1;
  eventBroker.addHandler(yuma.events.EventType.SELECTION_CREATED, function(event) {
    viewer.addAnnotation(new yuma.Annotation('annotation #' + dummyCounter, event.target.getShape()));
    
    /*
    var editForm = goog.soy.renderAsElement(yuma.templates.editform);
    goog.dom.appendChild(annotationLayer, editForm);

    var btnSave = goog.dom.query('.annotation-save', editForm)[0];
    goog.events.listen(btnSave, goog.events.EventType.CLICK, function(event) {
      console.log('mouseover');
      goog.events.Event.stopPropagation(event);
    });
    goog.style.setPosition(editForm, 120, 120);
    */

    dummyCounter++;
    goog.style.setStyle(editCanvas, 'pointer-events', 'none'); 
  });

  // For testing purposes 
  eventBroker.addHandler(yuma.events.EventType.ANNOTATION_MOUSE_ENTER, function(event) {
    console.log('entering ' + event.target.getCurrentAnnotation().text);
  });

  eventBroker.addHandler(yuma.events.EventType.ANNOTATION_MOUSE_LEAVE, function(event) {
    console.log('leaving ' + event.target.getCurrentAnnotation().text);
  });
}

window['ImageAnnotator'] = yuma.ImageAnnotator;
