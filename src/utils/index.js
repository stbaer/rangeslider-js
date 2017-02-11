import isFiniteNumber from "is-finite";
import CE from "custom-event";

function clamp(val, min, max) {
    return min < max ?
        (val < min ? min : val > max ? max : val) :
        (val < max ? max : val > min ? min : val);
}

function isHidden(el) {
    return el.offsetWidth === 0 || el.offsetHeight === 0 || el.open === false;
}

function isNumberLike(obj) {
    return isFiniteNumber(parseFloat(obj)) || isFiniteNumber(obj);
}

function getFirstNumberLike() {
    if (!arguments.length) {
        return null;
    }
    var i = 0;
    var len = arguments.length;
    for (i, len; i < len; i++) {
        if (isNumberLike(arguments[i])) {
            return arguments[i];
        }
    }
}

function getHiddenParentNodes(element) {

    var parents = [];
    var node = element.parentNode;

    while (node && isHidden(node)) {
        parents.push(node);
        node = node.parentNode;
    }
    return parents;
}

function getDimension(element, key) {

    var hiddenParentNodes = getHiddenParentNodes(element);
    var hiddenParentNodesLength = hiddenParentNodes.length;
    var dimension = element[key];
    var displayProperty = [];
    var i = 0;
    var hiddenStyles;

    // Used for native `<details>` elements
    function toggleOpenProperty(element) {
        if (typeof element.open !== 'undefined') {
            element.open = !element.open;
        }
    }

    if (hiddenParentNodesLength) {

        for (i = 0; i < hiddenParentNodesLength; i++) {
            hiddenStyles = hiddenParentNodes[i].style;
            // Cache the display property to restore it later.
            displayProperty[i] = hiddenStyles.display;
            hiddenStyles.display = 'block';
            hiddenStyles.height = '0';
            hiddenStyles.overflow = 'hidden';
            hiddenStyles.visibility = 'hidden';

            toggleOpenProperty(hiddenParentNodes[i]);
        }

        dimension = element[key];

        for (i = 0; i < hiddenParentNodesLength; i++) {
            hiddenStyles = hiddenParentNodes[i].style;
            toggleOpenProperty(hiddenParentNodes[i]);
            hiddenStyles.display = displayProperty[i];
            hiddenStyles.height = '';
            hiddenStyles.overflow = '';
            hiddenStyles.visibility = '';
        }
    }
    return dimension;
}

/**
 *
 * @param {Element} el
 * @param {function} callback
 * @returns {Element}
 */
function forEachAncestorsAndSelf(el, callback) {
    callback(el);
    while (el.parentNode && !callback(el)) {
        el = el.parentNode;
    }
    return el;
}

/**
 * @param {Element} referenceNode after this
 * @param {Element} newNode insert this
 */
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export default {
    emit:  function(el, name, opt) {
        el.dispatchEvent(new CE(name, opt));
    },
    isFiniteNumber: isFiniteNumber,
    getFirstNumberLike: getFirstNumberLike,
    getDimension: getDimension,
    insertAfter: insertAfter,
    forEachAncestorsAndSelf: forEachAncestorsAndSelf,
    clamp: clamp
};
