var express  = require('express');
var app = express();
var Port = process.env.PORT || 3000;
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
// run the app
app.get("/",(req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.listen(Port,() => {
    console.log(`server is running on port ${Port}`);
});