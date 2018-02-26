var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var convertExcel = require('excel-as-json').processFile


http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      console.log(files.filetoupload.name);
      var oldpath = files.filetoupload.path;
      console.log(process.cwd());
      console.log(files.filetoupload.name);
      var newpath = process.cwd() + '/' + files.filetoupload.name;
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
      });
    });
  } else if(req.url == '/getData') {
    var options = {
      sheet:'1',
      isColOriented: false,
      omitEmtpyFields: false
    }
    convertExcel('FinDexWorkBook.xlsx', 'row.json', options, (err, data) => {
      if(err) {
        console.log( "JSON conversion failure: #{err}");
        return err;
      } else {
        console.log('success');
        res.write(JSON.stringify(data));
        return res.end();
      }
    })
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080);
