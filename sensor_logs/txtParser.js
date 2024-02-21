// Import the fs module for file system operations
const fs = require('fs')

// Specify the path to the text file and the output JS file
const inputFile = './logs20Feb.txt'
const outputFile = './motionLogs.js'

// Read the content of the text file
fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err)
    return
  }

  // Split the content into lines to create an array of strings
  const lines = data.split(/\r?\n/) // This regex handles both Windows (\r\n) and UNIX (\n) newlines

  // Remove any empty lines that may result from splitting (e.g., a newline at the end of the file)
  const filteredLines = lines.filter((line) => line.trim() !== '')

  // Prepare the array as a string to be written into a JS file
  const arrayString = `window.motionLogs = ${JSON.stringify(filteredLines, null, 2)};`

  // Write the JS array to a file
  fs.writeFile(outputFile, arrayString, (err) => {
    if (err) {
      console.error('Error writing the JavaScript file:', err)
      return
    }
    console.log('JavaScript file was saved successfully.')
  })
})
