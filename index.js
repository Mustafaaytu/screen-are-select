//svg ********************************************************************
var svgCanvas = document.querySelector("svg");
var svgNS = "http://www.w3.org/2000/svg";
var rectangles = [];
var myShadowBackground = document.querySelector("#my-shadow-background");


var onresize = function() {
  width = document.body.clientWidth;
  height = document.body.clientHeight;

  //resize default svg
  svgCanvas.setAttribute("width", width);
  svgCanvas.setAttribute("height", height);
  svgCanvas.setAttribute("viewBox", "0 0 " + width + " " + height);
  
  var d = myShadowBackground.getAttribute("d");
  var pathArray = d.split("\n");
  var newbgArea = `M0 0 h${width} v${height} h-${width} Z`;

  pathArray[0] = newbgArea;
  d = pathArray.join("\n");
  myShadowBackground.setAttribute("d", d);
}

//if the screen size is resized, the size of the rectangles in the svg changes.
window.addEventListener("resize", onresize);

// Run function on load, could also run on dom ready
// We will adjust the size of the rectangels in the svg.
window.onload = function() {
  width = document.body.clientWidth;
  height = document.body.clientHeight;

  svgCanvas.setAttribute("width", width);
  svgCanvas.setAttribute("height", height);
  svgCanvas.setAttribute("viewBox", "0 0 " + width + " " + height);
  
  // Then we changed the size of bg path inside for path of inside in svg.
  var d = myShadowBackground.getAttribute("d");
  var pathArray = d.split("\n");
  var newbgArea = `M0 0 h${width} v${height} h-${width} Z`;
  // We will change first index
  pathArray[0] = newbgArea;
  d = pathArray.join("\n");
  myShadowBackground.setAttribute("d", d);
}

function Rectangle(x, y, w, h, svgCanvas) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.stroke = 5;
  this.el = document.createElementNS(svgNS, "rect");
  this.el.setAttribute("data-index", rectangles.length);
  this.el.setAttribute("id", "rect-id-" + rectangles.length);
  this.el.setAttribute("class", "edit-rectangle highlight");
  rectangles.push(this);
  
  svgCanvas.appendChild(this.el);
}

Rectangle.prototype.draw = function() {
  this.el.setAttribute("x", this.x + this.stroke / 2);
  this.el.setAttribute("y", this.y + this.stroke / 2);
  this.el.setAttribute("width", this.w - this.stroke);
  this.el.setAttribute("height", this.h - this.stroke);
  this.el.setAttribute("stroke-width", this.stroke);
  updateSvgBgPath(this.el);
};

//************************* draw*************************
const interactSvgCanvas = interact('.my-ss-container');


function endMoving(event) {
  rect = rectangles[rectangles.length-1];
  let delButton = document.createElement("button");
  delButton.setAttribute("class", "del-select del-icon del-button");
  delButton.setAttribute("id", `del-button-${rectangles.length-1}`);
  delButton.setAttribute("x", rect.x + rect.w);
  delButton.setAttribute("y", rect.y);
  delButton.setAttribute("rect-id", rectangles.length - 1);
  delButton.style.left = parseFloat(rect.x + rect.w).toString() + "px";
  delButton.style.top  = parseFloat(rect.y).toString() + "px";
  delButton.onclick = deleteRect;
  document.querySelector(`.my-ss-container`).appendChild(delButton);
}

interactSvgCanvas.draggable({
  onstart: function (event) {
    new Rectangle(event.pageX, event.pageY, 50, 50, svgCanvas);
  },
  onmove : targetMoving,
  onend  : endMoving,
})

function targetMoving (event) {
  var rectangle = rectangles[rectangles.length-1];
  rectangle.w = (event.pageX - rectangle.x) < 5 ? 10 : (event.pageX - rectangle.x);
  rectangle.h = (event.pageY - rectangle.y) < 5 ? 10 : (event.pageY - rectangle.y);
  console.log("moving");
  rectangle.draw();

}


// ****** resize and drag process******************************************
interact(".edit-rectangle")
  .rectChecker(function(element) {
    // find the Rectangle object that the element belongs to
    var rectangle = rectangles[element.getAttribute("data-index")];
    // return a suitable object for interact.js
    return {
      left: rectangle.x,
      top: rectangle.y,
      right: rectangle.x + rectangle.w,
      bottom: rectangle.y + rectangle.h
    };
  })
  .draggable({
    max: Infinity,
    inertia: true,
    listeners: {
      move(event) {
        var rectangle = rectangles[event.target.getAttribute("data-index")];
        rectangle.x = event.rect.left;
        rectangle.y = event.rect.top;
        setRenctangelDelButton(rectangle, event.target.getAttribute("data-index"));
        rectangle.draw();

      }
    },
    modifiers: [
      interact.modifiers.restrictRect({
        // restrict to a parent element that matches this CSS selector
        restriction: "svg",
        // only restrict before ending the drag
        endOnly: true
      })
    ]
  })
  .resizable({
    edges: { left: true, top: true, right: true, bottom: true },
    listeners: {
      move(event) {
        var rectangle = rectangles[event.target.getAttribute("data-index")];
        rectangle.w = event.rect.width;
        rectangle.h = event.rect.height;
        rectangle.x = event.rect.left;
        rectangle.y = event.rect.top;
        setRenctangelDelButton(rectangle, event.target.getAttribute("data-index"));
        rectangle.draw();
      }
    },
    modifiers: [
      interact.modifiers.restrictEdges({ outer: "svg", endOnly: true }),
      interact.modifiers.restrictSize({ min: { width: 20, height: 20 } })
    ]
  });

interact.maxInteractions(Infinity);

function updateSvgBgPath(rect) {
  var dataIndex = rect.getAttribute("data-index");
  var d = myShadowBackground.getAttribute("d");
  var newRectPath = `M${rect.getAttribute("x")} ${rect.getAttribute("y")} h${rect.getAttribute("width")} v${rect.getAttribute("height")} h-${rect.getAttribute("width")} Z`;
  var newD = setPathWithIndex(d, dataIndex, newRectPath);

  myShadowBackground.setAttribute("d", newD);
}

function setPathWithIndex(d, index, newPath) {
    let pathArray = d.split("\n");
    pathArray[parseInt(index)+1] = newPath;
    return pathArray.join("\n");
}

function removePathWithIndex(d, index) {
  let pathArray = d.split("\n");
  pathArray.splice(parseInt(index)+1, 1);
  
  return pathArray.join("\n");
}

function setRenctangelDelButton(rectangle, index) {
  delButton = document.getElementById(`del-button-${(parseInt(index) )}`);

  if(rectangle.x + rectangle.w + 24 >= svgCanvas.width.baseVal["valueInSpecifiedUnits"]){
    delButton.style.left = parseFloat(rectangle.x - 20).toString() + "px";
    delButton.style.top  = parseFloat(rectangle.y).toString() + "px"; 
  }else {
    delButton.style.left = parseFloat(rectangle.x + rectangle.w).toString() + "px";
    delButton.style.top  = parseFloat(rectangle.y).toString() + "px"; 
  }

  console.log(rectangle.x + rectangle.w);
}

function deleteRect() {
  let deletedButtonIndex = parseInt(this.getAttribute("rect-id"));
  var d       = myShadowBackground.getAttribute("d");
  let editedD = removePathWithIndex(d, this.getAttribute("rect-id"));
  myShadowBackground.setAttribute("d", editedD);
  
  rectangles.splice(this.getAttribute("rect-id"), 1);

  document.getElementById(`rect-id-${deletedButtonIndex}`).remove();

  this.remove();
  
  document.querySelectorAll("rect").forEach(function(rect, index) {
    if( rect.getAttribute("data-index") > deletedButtonIndex  ) {
      rect.setAttribute("data-index", (parseInt(rect.getAttribute("data-index")) - 1).toString());
      rect.setAttribute("id", ("rect-id-"+  parseInt(rect.getAttribute("data-index"))  ));
      let butonumuz = document.getElementById(`del-button-${parseInt(rect.getAttribute("data-index"))+1}`);
      butonumuz.setAttribute("rect-id", parseInt(rect.getAttribute("data-index")));
      butonumuz.setAttribute("id", `del-button-${parseInt(rect.getAttribute("data-index"))}`);
    }
  })
}