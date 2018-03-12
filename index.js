var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var convertExcel = require('excel-as-json').processFile;

var port = process.env.PORT || 8080;

http.createServer(function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      console.log(files.filetoupload.name);
      var oldpath = files.filetoupload.path;

      // var options = {
      //   sheet:'1',
      //   isColOriented: false,
      //   omitEmtpyFields: false
      // }
      // convertExcel(oldpath, 'row.json', options, (err, data) => {
      //   if(err) {
      //     console.log( "JSON conversion failure: #{err}");
      //     return err;
      //   } else {
      //     console.log('success');
      //     res.write(JSON.stringify(data));
      //     return res.end();
      //   }
      // });

      console.log(process.cwd());
      console.log(files.filetoupload.name);
      var newpath = process.cwd() + '/' + files.filetoupload.name;
      // fs.rename(oldpath, newpath, function (err) {
      //   if (err) throw err;
      //   res.write('File uploaded and moved!');
      //   res.end();
      // });


      fs.readFile(oldpath, function (err, data) {
            if (err) throw err;
            console.log('File read!');

            // Write the file
            fs.writeFile(newpath, data, function (err) {
                if (err) throw err;
                res.write('Awesome.. file uploaded!');
                res.end();
                console.log('File written!');
            });

            // Delete the file
            fs.unlink(oldpath, function (err) {
                if (err) throw err;
                console.log('File deleted!');
            });
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
  } else if(req.url == '/getPercentileData') {
    var options = {
      sheet:'4',
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
}).listen(port);
