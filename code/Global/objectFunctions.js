/**
 * check if email-adress is syntactically correct
 */

function checkEmail(address) {
   var m = new Mail();
   m.addTo(address);
   if (m.status)
      return false;
   return true;
}


/**
 * function checks if req.data.date[Year|Month|Date|Hours|Minutes] is valid
 * if correct, creates dateobject and returns it
 * otherwise false
 */

function checkDate() {
   if (req.data.dateYear && req.data.dateMonth && req.data.dateDate && req.data.dateHours && req.data.dateMinutes) {
      var ts = new Date();
      ts.setYear(parseInt(req.data.dateYear));
      ts.setMonth(parseInt(req.data.dateMonth));
      ts.setDate(parseInt(req.data.dateDate));
      ts.setHours(parseInt(req.data.dateHours));
      ts.setMinutes(parseInt(req.data.dateMinutes));
      ts.setSeconds(0);
      return (ts);
   } else
      return false;
}

/**
 * scheduler, basically doin' nothing
 */

function scheduler() {
   return;
}

/**
 * onStart-function, basically doin' nothing
 */

function onStart() {
   return;
}

/**
 * functin checks if the string passed contains special characters like
 * spaces, brackets etc.
 */

function isClean(str) {
   var validChar = new RegExp("[^a-z,^A-Z,^0-9]");
   if (validChar.exec(str))
      return false;
   return true;
}

/**
 * function checks if there is a weblog-object in path
 * if true, it sets the skin of response to "page" and returns the weblog-object found
 * if false, it uses root and it's page-skin
 */

function setLayout() {
   if (path.weblog) {
      res.skin = "weblog.page";
      return (path.weblog);
   } else {
      res.skin = "root.page";
      return (root);
   }
}

/**
 * function creates macro-tags out of plain urls in text
 * does this with three replace-operations
 */

function formatLinks(str) {
   var pre = "<% this.link to=\"";
   var mid = "\" text=\"";
   var post = "\" %>";
   var l0 = new RegExp("<a href\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?>([^<]*?)</a>");
   var l1 = new RegExp("([fhtpsr]+:\\/\\/[^\\s]+?)([\\.,;\\)\\]\"]?(\\s|$))");
   var l2 = new RegExp("(<%[^%]*?)" + pre + "(.*?)" + mid + ".*?" + post + "([^%]*?%>)");
   l0.ignoreCase = l1.ignoreCase = l2.ignoreCase = true;
   l0.global = l1.global = l2.global = true;
   
   str = str.replace(l0, pre + "$1" + mid + "$2" + post);
   str = str.replace(l1, pre + "$1" + mid + "$1" + post + "$3");
   str = str.replace(l2, "$1$2$3");
   /* old version:
   var pre = "<% this.link to=\"";
   var mid = "\" text=\"";
   var post = "\" %>";
   var l0 = new RegExp("<\\s*a\\s*href\\s*=\\s*\"?([^\\s\"]+)?\"?[^>]*?>([^<]*?)</a>");
   var l1 = new RegExp("([fhtpsr]+:\\/\\/[^\\s]+?)([\\.,;\\)\\]\"]?(\\s|$))");
   var l2 = new RegExp("(<%[^%]*?)" + pre + "(.*?)" + mid + ".*?" + post + "([^%]*?%>)");
   l0.ignoreCase = l1.ignoreCase = l2.ignoreCase = true;
   l0.global = l1.global = l2.global = true;
   
   str = str.replace(l0, pre + "$1" + mid + "$2" + post);
   str = str.replace(l1, pre + "$1" + mid + "link" + post + "$2");
   str = str.replace(l2, "$1$2$3");
   */
   return (str);
}