/*!

 Split Pane v0.5.1 (modified by Mathew Kurian - removed JQuery dep.)

 Copyright (c) 2014 Simon Hagström

 Released under the MIT license
 https://raw.github.com/shagstrom/split-pane/master/LICENSE

 */

function SplitPane(root) {

  function getElement(tag, className) {
    var node = document.createElement(tag);
    node.className = className;
    return node;
  }

  var RESIZE_EVENT = new Event('resize');

  this.bind = function () {
    setMinHeightAndMinWidth(root);
    root.appendChild(getElement('div', 'split-pane-resize-shim'));
    this.eventType = ('ontouchstart' in document) ? 'touchstart' : 'mousedown';
    root.querySelector('.split-pane-divider').innerHTML = '<div class="split-pane-divider-inner"></div>';
    root.querySelector('.split-pane-divider').addEventListener(this.eventType, mousedownHandler);
    setTimeout(function () {
      window.dispatchEvent(RESIZE_EVENT);
    }, 100);
  };

  this.unbind = function () {
    root.querySelector('.split-pane-divider').removeEventListener(this.eventType, mousedownHandler);
  };

  function setMinHeightAndMinWidth(root) {
    var splitPane = root,
      comps = splitPane.querySelectorAll('.split-pane-component');
    var first = comps[0],
      div = splitPane.querySelector('.split-pane-divider'),
      last = comps[1];
    ;
    if (containsClass(root, ['fixed-top', 'fixed-bottom', 'horizontal-percent'])) {
      root.style.minHeight = (minHeight(first) + minHeight(last) + div.offsetHeight) + 'px';
    } else {
      root.style.minWidth = (minWidth(first) + minWidth(last) + div.offsetWidth) + 'px';
    }
  }

  function containsClass(a, b) {
    for (var i = 0; i < b.length; i++) {
      if (a.classList.contains(b[i])) {
        return true;
      }
    }

    return false;
  }

  function mousedownHandler(event) {
    event.preventDefault();
    var isTouchEvent = event.type.match(/^touch/),
      moveEvent = isTouchEvent ? 'touchmove' : 'mousemove',
      endEvent = isTouchEvent ? 'touchend' : 'mouseup',
      divider = this;
    var root = divider.parentElement,
      resizeShim = root.querySelector('.split-pane-resize-shim');
    resizeShim.style.display = 'block';
    divider.classList.add('dragged');
    if (isTouchEvent) {
      divider.classList.add('touch');
    }
    var moveEventHandler = createMousemove(root, pageXof(event), pageYof(event));
    document.addEventListener(moveEvent, moveEventHandler);
    document.addEventListener(endEvent, function (event) {
      document.removeEventListener(moveEvent, moveEventHandler);
      divider.classList.remove('dragged', 'touch');
      resizeShim.style.display = 'none';
    }, false);
  }

  function createMousemove(root, pageX, pageY) {
    var splitPane = root,
      comps = splitPane.querySelectorAll('.split-pane-component');
    var firstComponent = comps[0],
      divider = splitPane.querySelector('.split-pane-divider'),
      lastComponent = comps[1];
    if (root.classList.contains('fixed-top')) {
      var firstComponentMinHeight = minHeight(firstComponent),
        maxFirstComponentHeight = splitPane.offsetHeight - minHeight(lastComponent) - divider.offsetHeight,
        topOffset = divider.offsetTop - pageY;
      return function (event) {
        event.preventDefault();
        var top = Math.min(Math.max(firstComponentMinHeight, topOffset + pageYof(event)), maxFirstComponentHeight);
        setTop(firstComponent, divider, lastComponent, top + 'px');
        root.dispatchEvent(RESIZE_EVENT)
      };
    } else if (root.classList.contains('fixed-bottom')) {
      var lastComponentMinHeight = minHeight(lastComponent),
        maxLastComponentHeight = splitPane.offsetHeight - minHeight(firstComponent) - divider.offsetHeight,
        bottomOffset = lastComponent.offsetHeight + pageY;
      return function (event) {
        event.preventDefault();
        var bottom = Math.min(Math.max(lastComponentMinHeight, bottomOffset - pageYof(event)), maxLastComponentHeight);
        setBottom(firstComponent, divider, lastComponent, bottom + 'px');
        root.dispatchEvent(RESIZE_EVENT)
      };
    } else if (root.classList.contains('horizontal-percent')) {
      var splitPaneHeight = splitPane.offsetHeight,
        lastComponentMinHeight = minHeight(lastComponent),
        maxLastComponentHeight = splitPaneHeight - minHeight(firstComponent) - divider.offsetHeight,
        bottomOffset = lastComponent.offsetHeight + pageY;
      return function (event) {
        event.preventDefault();
        var bottom = Math.min(Math.max(lastComponentMinHeight, bottomOffset - pageYof(event)), maxLastComponentHeight);
        setBottom(firstComponent, divider, lastComponent, (bottom / splitPaneHeight * 100) + '%');
        root.dispatchEvent(RESIZE_EVENT)
      };
    } else if (root.classList.contains('fixed-left')) {
      var firstComponentMinWidth = minWidth(firstComponent),
        maxFirstComponentWidth = splitPane.offsetWidth - minWidth(lastComponent) - divider.offsetWidth,
        leftOffset = divider.offsetLeft - pageX;
      return function (event) {
        event.preventDefault();
        var left = Math.min(Math.max(firstComponentMinWidth, leftOffset + pageXof(event)), maxFirstComponentWidth);
        setLeft(firstComponent, divider, lastComponent, left + 'px')
        root.dispatchEvent(RESIZE_EVENT)
      };
    } else if (root.classList.contains('fixed-right')) {
      var lastComponentMinWidth = minWidth(lastComponent),
        maxLastComponentWidth = splitPane.offsetWidth - minWidth(firstComponent) - divider.offsetWidth,
        rightOffset = lastComponent.offsetWidth + pageX;
      return function (event) {
        event.preventDefault();
        var right = Math.min(Math.max(lastComponentMinWidth, rightOffset - pageXof(event)), maxLastComponentWidth);
        setRight(firstComponent, divider, lastComponent, right + 'px');
        root.dispatchEvent(RESIZE_EVENT)
      };
    } else if (root.classList.contains('vertical-percent')) {
      var splitPaneWidth = splitPane.offsetWidth,
        lastComponentMinWidth = minWidth(lastComponent),
        maxLastComponentWidth = splitPaneWidth - minWidth(firstComponent) - divider.offsetWidth,
        rightOffset = lastComponent.offsetWidth + pageX;
      return function (event) {
        event.preventDefault();
        var right = Math.min(Math.max(lastComponentMinWidth, rightOffset - pageXof(event)), maxLastComponentWidth);
        setRight(firstComponent, divider, lastComponent, (right / splitPaneWidth * 100) + '%');
        root.dispatchEvent(RESIZE_EVENT)
      };
    }
  }

  function pageXof(event) {
    return event.pageX || event.originalEvent.pageX;
  }

  function pageYof(event) {
    return event.pageY || event.originalEvent.pageY;
  }

  function minHeight(element) {
    return parseInt((element.get ? element.get(0) : element).style.minHeight) || 0;
  }

  function minWidth(element) {
    return parseInt((element.get ? element.get(0) : element).style.minWidth) || 0;
  }

  function setTop(firstComponent, divider, lastComponent, top) {
    firstComponent.style.height = top;
    divider.style.top = top;
    lastComponent.style.top = top;
  }

  function setBottom(firstComponent, divider, lastComponent, bottom) {
    firstComponent.style.bottom = bottom;
    divider.style.bottom = bottom;
    lastComponent.style.height = bottom;
  }

  function setLeft(firstComponent, divider, lastComponent, left) {
    firstComponent.style.width = left;
    divider.style.left = left;
    lastComponent.style.left = left;
  }

  function setRight(firstComponent, divider, lastComponent, right) {
    firstComponent.style.right = right;
    divider.style.right = right;
    lastComponent.style.width = right;
  }
}

if (typeof module !== 'undefined') {
  module.exports = SplitPane;
}

if (typeof exports !== 'undefined') {
  exports = SplitPane;
}