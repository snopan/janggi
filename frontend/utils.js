const row_index = (row) => {
    // Converts 1-9 to 0-8
    return row - 1;
}

const col_index = (col) => {
    // Converts A-I to 0-9
    return col.charCodeAt(0) - 65;
}

const reverse_row_index = (row_index) => {
    return row_index + 1;
}

const reverse_col_index = (col_index) => {
    return String.fromCharCode(col_index + 65);
}

// Copy to clipboard
// ref: https://stackoverflow.com/questions/400212
const fallbackCopyTextToClipboard = (text) => {
  let textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    let successful = document.execCommand('copy');
    let msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

const copyTextToClipboard = (text) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
    console.error('Async: Could not copy text: ', err);
  });
}

const objArrAssignID = (obj_arr) => {
    obj_arr.map( (obj) => {
        obj.id = ID();
    })
}

// Reference: https://gist.github.com/gordonbrander/2230317
const ID = () => {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};

export default {
    row_index,
    col_index,
    reverse_row_index,
    reverse_col_index,
    copyTextToClipboard,
    objArrAssignID,
    ID
}
