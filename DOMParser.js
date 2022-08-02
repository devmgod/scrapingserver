fetch('https://opensea.io/0xE1363434c88Fcc2939211995EBFacD6fF7f4CB39?search[sortBy]=PRICE&search[sortAscending]=false')
    .then(function(response) {
        // When the page is loaded convert it to text
        return response.text()
    })
    .then(function(html) {
        // Initialize the DOM parser
        var parser = new DOMParser();

        // Parse the text
        var doc = parser.parseFromString(html, "text/html");

        // You can now even select part of that html as you would in the regular DOM 
        // Example:
        // var docArticle = doc.querySelector('article').innerHTML;

        console.log(doc.getElementsByTagName('article')[0].getElementsByTagName('a')[0].getAttribute('href'));
    })
    .catch(function(err) {
        console.log('Failed to fetch page: ', err);
    });