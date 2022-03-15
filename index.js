



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
  this.el.setAttribute("class", "edit-rectangle highlight");
  rectangles.push(this);
  
  //let group = document.createElementNS(svgNS, "g");
  //svgCanvas.appendChild(this.el);
}

Rectangle.prototype.draw = function() {
  this.el.setAttribute("x", this.x + this.stroke / 2);
  this.el.setAttribute("y", this.y + this.stroke / 2);
  this.el.setAttribute("width", this.w - this.stroke);
  this.el.setAttribute("height", this.h - this.stroke);
  this.el.setAttribute("stroke-width", this.stroke);
  updateSvgBgPath(this.el);
};


function showEventInfo (event) {
  console.log("burdayım");
  console.log(event);
  const actionInfo = JSON.stringify(event.interaction.prepared, null, 2);
}


//************************* draw*************************
const interactSvgCanvas = interact('.my-ss-container');
 /* 
interactSvgCanvas.draggable({
  listeners: {
    start (event) {
      let newRect   = new Rectangle(event.pageX, event.pageY, 50, 50, svgCanvas);
      let group     = document.createElementNS(svgNS, "g");
      group.setAttribute("id", `group-${rectangles.length}`);

      group.appendChild(newRect.el);
      svgCanvas.appendChild(group);

      //console.log(newRect);
    },
    move: targetMoving,
    onend: showEventInfo,
  }
})*/

function endMoving(event) {
  rect = rectangles[rectangles.length-1];
  console.log(rect);
  //let delRect = document.createElementNS(svgNS, "rect");
  let delButton = document.createElement("button");
  delButton.setAttribute("class", "del-select del-icon del-button");
  delButton.setAttribute("id", `del-button-${rectangles.length}`);
  delButton.setAttribute("x", rect.x + rect.w);
  delButton.setAttribute("y", rect.y);
  delButton.setAttribute("rect-id", rectangles.length);
  delButton.style.left = parseFloat(rect.x + rect.w + 6).toString() + "px";
  delButton.style.top  = parseFloat(rect.y + 8).toString() + "px";
  delButton.onclick = deleteRect;

  //delRect.setAttribute("class", "del-background del-icon");
  //delRect.setAttribute("id", `del-rect-${rectangles.length}`);
  //delRect.setAttribute("x", rect.x + rect.w);
  //delRect.setAttribute("y", (rect.y).toString());
  //delRect.setAttribute("width", 20);
  //delRect.setAttribute("height", 20);
  //delRect.setAttribute("stroke-width", 5);

  document.querySelector(`.my-ss-container`).appendChild(delButton);
}

interactSvgCanvas.draggable({
  onstart: function (event) {
    let newRect   = new Rectangle(event.pageX, event.pageY, 50, 50, svgCanvas);
    let group     = document.createElementNS(svgNS, "g");
    group.setAttribute("id", `group-${rectangles.length}`);

    group.appendChild(newRect.el);
    svgCanvas.appendChild(group);
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
  pathArray.splice(parseInt(index), 1);
  
  return pathArray.join("\n");
}

function setRenctangelDelButton(rectangle, index) {
  delButton = document.getElementById(`del-button-${(parseInt(index) + 1)}`);
  delButton.style.left = parseFloat(rectangle.x + rectangle.w + 6).toString() + "px";
  delButton.style.top  = parseFloat(rectangle.y + 8).toString() + "px"; 
}

function deleteRect() {
  rectangles.splice(this.getAttribute("rect-id")-1, 1);
  let rect    =  rectangles[this.getAttribute("rect-id")-1];
  let group   = document.getElementById(`group-${this.getAttribute("rect-id")}`);
  var d       = myShadowBackground.getAttribute("d");
  let editedD = removePathWithIndex(d, this.getAttribute("rect-id"));
  myShadowBackground.setAttribute("d", editedD);
  group.remove();
  this.remove();
}