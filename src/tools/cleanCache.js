const fs = require('fs');
const path = require('path');
const rimraf = require("./rimraf");
const util = require("../util");

let counter = 0;

function isSubDirectory(parent, child) {
    return path.relative(child, parent).startsWith('..');
}

const show_error = false;

function del(file, cachePath){
    if(isSubDirectory(cachePath, file)){
        rimraf(file, (err) =>{
            if(err){
                // try{
                //     const stat = fs.statSync(file);
                //     if(stat.isFile()){
                //         fs.unlinkSync(file);
                //     } else {
                //         fs.rmdirSync(file);
                //     }
                // }catch(e){
                //     console.error(file, e);
                // }
                show_error && console.error("[cache clean]", err);
            }
        });

        counter++;
        if(counter % 20 === 0){
            console.log("[cache clean] delete:", counter);
        }
    } else {
        throw "try to delete non-cache file";
    }
}

function cleanCache(cachePath){
    if(!fs.existsSync(cachePath)){
        err = fs.mkdir(cachePath, (err) => {
            if (err){
                 throw err;
            }
          });
    } else {
        _clean(cachePath);
    }
}

function _clean(cachePath){
    const folders1 = fs.readdirSync(cachePath);
    folders1.forEach(p1 => {
        try {
            p1 = path.resolve(cachePath, p1);
            const stat = fs.statSync(p1);
            if (stat.isFile()) {
                del(p1, cachePath);
            }else if(stat.isDirectory()){
                let subfiles = fs.readdirSync(p1);
                const noimages = subfiles.filter(e => !util.isImage(e));
                noimages.forEach(e => del(path.resolve(p1,e), cachePath));

                subfiles = subfiles.filter(e => util.isImage(e));
                util.sortFileNames(subfiles);
                if (subfiles.length === 0){
                    del(p1, cachePath);
                }else  if(subfiles.length === 1){
                    //nothing
                }else if(subfiles.length >= 2){
                    for(let ii = 1; ii < subfiles.length; ii++){
                        del(path.resolve(p1, subfiles[ii]));
                    }
                }
            }
        }catch(e){
            show_error && console.error("[cache clean] error",e);
        }
    });
    console.log("[cache clean] done");
}

module.exports.cleanCache = cleanCache;