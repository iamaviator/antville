//
// The Antville Project
// http://code.google.com/p/antville
//
// Copyright 2001-2007 by The Antville People
//
// Licensed under the Apache License, Version 2.0 (the ``License'');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an ``AS IS'' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// $Revision$
// $LastChangedBy$
// $LastChangedDate$
// $URL$
//

/**
 * main action, lists all members in alpabetical order
 */
MemberMgr.prototype.main_action = function() {
   this.renderView(this, getMessage("User.role.members"));
   return;
};

/**
 * list all subscribers of a site
 */
MemberMgr.prototype.subscribers_action = function() {
   this.renderView(this.subscribers, getMessage("User.role.subscribers"));
   return;
};

/**
 * list all contributors of a site
 */
MemberMgr.prototype.contributors_action = function() {
   this.renderView(this.contributors, getMessage("User.role.contributors"));
   return;
};

/**
 * list all content managers of a site
 */
MemberMgr.prototype.managers_action = function() {
   this.renderView(this.managers, getMessage("User.role.contentManagers"));
   return;
};

/**
 * list all admins of a site
 */
MemberMgr.prototype.admins_action = function() {
   this.renderView(this.admins, getMessage("User.role.administrators"));
   return;
};

/**
 * action for displaying the last updated 
 * site list of a user's subscriptions
 */
MemberMgr.prototype.updated_action = function() {
   res.data.title = getMessage("MemberMgr.updateTitle", {userName: session.user.name});
   res.data.sitelist = session.user.renderSkinAsString("sitelist");
   res.data.body = session.user.renderSkinAsString("subscriptions");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * action for displaying subscriptions of a user
 */
MemberMgr.prototype.subscriptions_action = function() {
   this.renderSubscriptionView(session.user.subscriptions, "Subscriptions");
   return;
};

/**
 * action for displaying memberships of a user
 */
MemberMgr.prototype.memberships_action = function() {
   this.renderSubscriptionView(session.user.memberships, "Memberships");
   return;
};

/**
 * action for creating a new Membership
 */
MemberMgr.prototype.create_action = function() {
   if (req.data.cancel)
      res.redirect(this.href());
   else if (req.data.keyword) {
      try {
         var result = this.searchUser(req.data.keyword);
         res.message = result.toString();
         res.data.searchresult = this.renderSkinAsString("searchresult", {result: result.obj});
      } catch (err) {
         res.message = err.toString();
      }
   } else if (req.data.add) {
      try {
         var result = this.evalNewMembership(req.data.username, session.user);
         res.message = result.toString();
         // send confirmation mail
         var sp = new Object();
         sp.site = result.obj.site.title;
         sp.creator = session.user.name;
         sp.url = result.obj.site.href();
         sp.account = result.obj.user.name;
         var mailbody = this.renderSkinAsString("mailnewmember", sp);
         sendMail(root.sys_email,
                  result.obj.user.email,
                  getMessage("mail.newMember", result.obj.site.title),
                  mailbody);
         res.redirect(result.obj.href("edit"));
      } catch (err) {
         res.message = err.toString();
         if (err instanceof MailException)
            res.redirect(result.obj.href("edit"));
         res.redirect(this.href());
      }
   }
   res.data.action = this.href(req.action);
   res.data.title = getMessage("MemberMgr.searchTitle", {siteTitle: this._parent.title});
   res.data.body = this.renderSkinAsString("new");
   res.handlers.context.renderSkin("page");
   return;
};

/**
 * edit actions for user profiles
 */
MemberMgr.prototype.edit_action = function() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.save) {
      try {
         res.message = this.updateUser(req.data);
         res.redirect(this._parent.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.title = getMessage("MemberMgr.editProfileTitle", {userName: session.user.name});
   res.data.body = session.user.renderSkinAsString("edit");
   this._parent.renderSkin("page");
   return;
};

/**
 * login action
 */
MemberMgr.prototype.login_action = function() {
   res.message = new Message("introLogin");
   if (req.data.login) {
      try {
         res.message = this.evalLogin(req.data.name, req.data.password);
         if (session.data.referrer) {
            var url = session.data.referrer;
            session.data.referrer = null;
         } else
            var url = this._parent.href();
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
      }
   }

   if (!session.data.referrer && req.data.http_referer)
      session.data.referrer = req.data.http_referer;
   res.data.action = this.href(req.action);
   res.data.title = getMessage("User.loginTitle");
   res.data.body = this.renderSkinAsString("login");
   this._parent.renderSkin("page");
   return;
};

/**
 * logout action
 */
MemberMgr.prototype.logout_action = function() {
   if (session.user) {
     res.message = new Message("logout", session.user.name);
     session.logout();
     session.data.referrer = null;
     res.setCookie ("avUsr", "");
     res.setCookie ("avPw", "");
   }
   res.redirect(this._parent.href());
   return;
};

/**
 * register action
 */
MemberMgr.prototype.register_action = function() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.register) {
      if (session.data.referrer) {
         var url = session.data.referrer;
         session.data.referrer = null;
      } else
         var url = this._parent.href();
      try {
         var result = this.evalRegistration(req.data);
         res.message = result.toString();
         // now we log in the user and send the confirmation mail
         session.login(result.obj.name, result.obj.password);
         if (root.sys_email) {
            var sp = {name: result.obj.name, password: result.obj.password};
            sendMail(root.sys_email,
                     result.obj.email,
                     getMessage("mail.registration", root.getTitle()),
                     this.renderSkinAsString("mailregconfirm", sp)
                    );
         }
         res.redirect(url);
      } catch (err) {
         res.message = err.toString();
         // if we got a mail exception redirect back
         if (err instanceof MailException)
            res.redirect(url);
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = getMessage("User.registerTitle");
   res.data.body = this.renderSkinAsString("register");
   this._parent.renderSkin("page");
   return;
};

/**
 * password reminder action
 */
MemberMgr.prototype.sendpwd_action = function() {
   if (req.data.cancel)
      res.redirect(this._parent.href());
   else if (req.data.send) {
      try {
         res.message = this.sendPwd(req.data.email);
         res.redirect(this._parent.href());
      } catch (err) {
         res.message = err.toString();
      }
   }

   res.data.action = this.href(req.action);
   res.data.title = getMessage("User.recoverPasswordTitle");
   res.data.body = this.renderSkinAsString("sendpwd");
   this._parent.renderSkin("page");
   return;
};
/**
 * macro renders a link to signup if user is not member of this site
 * if user is member, it displays the level of membership
 */

MemberMgr.prototype.membership_macro = function(param) {
   if (req.data.memberlevel == null)
      return;
   res.write(getRole(req.data.memberlevel));
   return;
};

/**
 * macro renders a link to signup-action
 * but only if user is not a member of this site
 * and the site is public
 */

MemberMgr.prototype.subscribelink_macro = function(param) {
   if (this._parent.online && req.data.memberlevel == null)
      Html.link({href: this._parent.href("subscribe")},
                param.text ? param.text : getMessage("MemberMgr.signUp"));
   return;
};

/**
 * macro renders a link to signup-action
 * but only if user is not a member of this site
 */

MemberMgr.prototype.subscriptionslink_macro = function(param) {
   if (session.user.size())
      Html.link({href: this.href("updated")},
                param.text ? param.text : getMessage("MemberMgr.subscriptions"));
   return;
};

/**
 * SORUA AuthURI
 */
MemberMgr.prototype.modSorua_action = function() {
   if (!app.data.modSorua) app.data.modSorua = new Array();
   var returnUrl = req.data["sorua-return-url"];
   var failUrl   = req.data["sorua-fail-url"];
   var userID    = req.data["sorua-user"];
   var action    = req.data["sorua-action"];
   if (action == "authenticate") {    // authenticate-action
      if (session.user && (userID == null || userID == "" || session.user.name == userID)) {
         // store returnUrl + timestamp + userID
         app.data.modSorua[returnUrl] = {time: new Date(), userID: session.user.name}; 
         res.redirect(returnUrl);
      } else if (failUrl) {
         res.redirect(failUrl);
      } else {
         session.data.modSorua = {returnUrl: returnUrl,
                                 userID: userID};
         res.redirect(this.href("modSoruaLoginForm"));
      }

   } else if (action == "verify") {
      // first remove outdated entries
      var now = new Date();
      var arr = new Array();
      for (var i in app.data.modSorua) {
         if (app.data.modSorua[i] && app.data.modSorua[i].time &&
            now.valueOf() - app.data.modSorua[i].time.valueOf() < 1000 * 60)
            arr[i] = app.data.modSorua[i];
      }
      app.data.modSorua = arr;
      // now check whether returnUrl has been used recently
      if (app.data.modSorua[returnUrl]) {
         res.status = 200;
         res.write("user:" + app.data.modSorua[returnUrl].userID);
         return;
      } else {
         res.status = 403;
         return;
      }

   } else { // handle wrong call of AuthURI
     res.redirect(root.href("main"));

   }   
};


/**
 * SORUA Login Form 
 */
MemberMgr.prototype.modSoruaLoginForm_action = function() {
   if (!session.data.modSorua || !session.data.modSorua.returnUrl) 
      res.redirect(root.href()); // should not happen anyways
   if (req.data.login) {
      try {
         res.message = this.evalLogin(req.data.name, req.data.password);
         var returnUrl = session.data.modSorua.returnUrl;
         app.data.modSorua[returnUrl] = {time: new Date(), userID: req.data.name};
         res.redirect(returnUrl);
      } catch (err) {
         res.message = err.toString();
      }      
   }
   res.data.action = this.href("modSoruaLoginForm");
   this.renderSkin("modSorua");
};
/**
 * check if a login attempt is ok
 * @param String username
 * @param String password
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
MemberMgr.prototype.evalLogin = function(username, password) {
   // check if login is successful
   if (!session.login(username, password))
      throw new Exception("loginTypo");
   // login was successful
   session.user.lastVisit = new Date();
   if (req.data.remember) {
      // user allowed us to set permanent cookies for auto-login
      res.setCookie("avUsr", session.user.name, 365);
      var ip = req.data.http_remotehost.clip(getProperty ("cookieLevel","4"),"","\\.");
      res.setCookie("avPw", (session.user.password + ip).md5(), 365);   
   }
   return new Message("welcome", [res.handlers.context.getTitle(), session.user.name]);
};


/**
 * check if a registration attempt is ok
 * @param Obj Object containing form-values needed for registration
 * @return Obj Object containing four properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 *             - username: username of registered user
 *             - password: password of registered user
 */
MemberMgr.prototype.evalRegistration = function(param) {
   // check if username is existing and is clean
   // can't use isClean() here because we accept
   // special characters like umlauts and spaces
   var invalidChar = new RegExp("[^a-zA-Z0-9����\\.\\-_ ]");
   if (!param.name)
      throw new Exception("usernameMissing");
   else if (param.name.length > 30)
      throw new Exception("usernameTooLong");
   else if (invalidChar.exec(param.name))
      throw new Exception("usernameNoSpecialChars");
   else if (this[param.name] || this[param.name + "_action"])
      throw new Exception("usernameExisting");

   // check if passwords match
   if (!param.password1 || !param.password2)
      throw new Exception("passwordTwice");
   else if (param.password1 != param.password2)
      throw new Exception("passwordNoMatch");

   // check if email-address is valid
   if (!param.email)
      throw new Exception("emailMissing");
   evalEmail(param.email);

   var newUser = app.registerUser(param.name, param.password1);
   if (!newUser)
      throw new Exception("memberExisting");
   newUser.email = param.email;
   newUser.publishemail = param.publishemail;
   newUser.url = evalURL(param.url);
   newUser.registered = new Date();
   newUser.blocked = 0;
   // grant trust and sysadmin-rights if there's no sysadmin 'til now
   if (root.manage.sysadmins.size() == 0)
      newUser.sysadmin = newUser.trusted = 1;
   else
      newUser.sysadmin = newUser.trusted = 0;
   if (path.Site) {
      var welcomeWhere = path.Site.title;
      // if user registered within a public site, we subscribe
      // user to this site
      if (path.Site.online)
         this.add(new Membership(newUser));
   } else
      var welcomeWhere = root.getTitle();
   return new Message("welcome", [welcomeWhere, newUser.name], newUser);
};


/**
 * update user-profile
 * @param Obj Object containing form values
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
MemberMgr.prototype.updateUser = function(param) {
   if (param.oldpwd) {
      if (session.user.password != param.oldpwd)
         throw new Exception("accountOldPwd");
      if (!param.newpwd1 || !param.newpwd2)
         throw new Exception("accountNewPwdMissing");
      else if (param.newpwd1 != param.newpwd2)
         throw new Exception("passwordNoMatch");
      session.user.password = param.newpwd1;
   }
   session.user.url = evalURL(param.url);
   session.user.email = evalEmail(param.email);
   session.user.publishemail = param.publishemail;
   return new Message("update");
};


/**
 * function retrieves a list of usernames/passwords for a submitted email-address
 * and sends them as mail
 * @param String email-address to search for accounts
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
MemberMgr.prototype.sendPwd = function(email) {
   if (!email)
      throw new Exception("emailMissing");
   var sqlClause = "select USER_NAME,USER_PASSWORD from AV_USER where USER_EMAIL = '" + email + "'";
   var dbConn = getDBConnection("antville");
   var dbResult = dbConn.executeRetrieval(sqlClause);
   var cnt = 0;
   var pwdList = "";
   while (dbResult.next()) {
      pwdList += getMessage("MemberMgr.userName") + ": " + dbResult.getColumnItem("USER_NAME") + "\n";
      pwdList += getMessage("MemberMgr.password") + ": " + dbResult.getColumnItem("USER_PASSWORD") + "\n\n";
      cnt++;
   }
   dbResult.release;
   if (!cnt)
      throw new Exception("emailNoAccounts");
   // now we send the mail containing all accounts for this email-address
   var mailbody = this.renderSkinAsString("mailpassword", {text: pwdList});
   sendMail(root.sys_email, email, getMessage("mail.sendPwd"), mailbody);
   return new Message("mailSendPassword");
};


/**
 * function searches for users using part of username
 * @param String Part of username or email-address
 * @return Obj Object containing four properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 *             - found (Int): number of users found
 *             - list (String): rendered list of users found
 */
MemberMgr.prototype.searchUser = function(key) {
   var dbConn = getDBConnection("antville");
   var dbError = dbConn.getLastError();
   if (dbError)
      throw new Exception("database", dbError);
   var query = "select USER_NAME,USER_URL from AV_USER ";
   query += "where USER_NAME like '%" + key + "%' order by USER_NAME asc";
   var searchResult = dbConn.executeRetrieval(query);
   var dbError = dbConn.getLastError();
   if (dbError)
      throw new Exception("database", dbError);
   var found = 0;
   res.push();
   while (searchResult.next() && found < 100) {
      var name = searchResult.getColumnItem("USER_NAME");
      var url = searchResult.getColumnItem("USER_URL");
      // do nothing if the user is already a member
      if (this.get(name))
         continue;
      var sp = {name: name,
                description: (url ? Html.linkAsString({href: url}, url) : null)};
      this.renderSkin("searchresultitem", sp);
      found++;
   }
   dbConn.release();
   switch (found) {
      case 0:
         throw new Exception("resultNoUser");
      case 1:
         return new Message("resultOneUser", null, res.pop());
      case 100:
         return new Message("resultTooManyUsers", null, res.pop());
      default:
         return new Message("resultManyUsers", found, res.pop());
   }
};


/**
 * function adds a user with a given username to the list of members
 * of this site
 * @param String Name of user to add to members
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
MemberMgr.prototype.evalNewMembership = function(username, creator) {
   var newMember = root.users.get(username);
   if (!newMember)
      throw new Exception("resultNoUser");
   else if (this.get(username))
      throw new Exception("userAlreadyMember");
   try {
      var ms = new Membership(newMember);
      this.add(ms);
      return new Message("memberCreate", ms.user.name, ms);
   } catch (err) {
      throw new Exception("memberCreate", username);
   }
   return;
};


/**
 * function deletes a member
 * @param Obj Membership-Object to delete
 * @param Obj User-Object about to delete membership
 * @return Obj Object containing two properties:
 *             - error (boolean): true if error happened, false if everything went fine
 *             - message (String): containing a message to user
 */
MemberMgr.prototype.deleteMembership = function(membership) {
   if (!membership)
      throw new Error("memberDelete");
   else if (membership.level == ADMIN)
      throw new Error("adminDelete");
   membership.remove();
   return new Message("memberDelete");
};


/**
 * function deletes all members
 */
MemberMgr.prototype.deleteAll = function() {
   for (var i=this.size();i>0;i--)
      this.get(i-1).remove();
   return true;
};


/**
 * function retrieves the level of a users membership
 */
MemberMgr.prototype.getMembershipLevel = function(usr) {
   var ms = this.get(usr.name);
   if (!ms)
      return null;
   return ms.level;
};
/**
 * render the list of members of a site
 */
MemberMgr.prototype.renderMemberlist = function() {
   var currLvl = null;
   res.push();
   for (var i=0;i<this.size();i++) {
      var m = this.get(i);
      if (m.level != currLvl) {
         this.renderSkin("membergroup", {group: getRole(m.level)});
         currLvl = m.level;
      }
      m.renderSkin("mgrlistitem");
   }
   return res.pop();
};

/**
 * render the whole page containing a list of members
 * @param Object collection to work on
 * @param String Title to use
 */
MemberMgr.prototype.renderView = function(collection, title) {
   if (this._parent != root) {
      res.data.title = getMessage("MemberMgr.viewListTitle", {title: title, siteName: this._parent.title});
      res.data.memberlist = renderList(collection, "mgrlistitem", 10, req.data.page);
      res.data.pagenavigation = renderPageNavigation(collection, this.href(req.action), 10, req.data.page);
      res.data.body = this.renderSkinAsString("main");
      res.handlers.context.renderSkin("page");
   }
   return;
};

/**
 * render the whole page containing a list of sites (subscriptions)
 * @param Object collection to work on
 * @param String page title
 */
MemberMgr.prototype.renderSubscriptionView = function(collection, title) {
   var sitelist = collection.list();
   var sorter = function(a, b) {
      var str1 = a.site.title.toLowerCase();
      var str2 = b.site.title.toLowerCase();
      if (str1 > str2)
         return 1;
      else if (str1 < str2)
         return -1;
      return 0;
   }
   sitelist.sort(sorter);
   res.data.title = getMessage("MemberMgr.subscriptionsTitle", {titel: title, userName: session.user.name});
   res.data.sitelist = renderList(sitelist, "subscriptionlistitem");
   res.data.body = session.user.renderSkinAsString("subscriptions");
   res.handlers.context.renderSkin("page");
   return;
};
/**
 * permission check (called by hopobject.onRequest())
 * @param String name of action
 * @param Obj User object
 * @param Int Membership level
 * @return Obj Exception object or null
 */
MemberMgr.prototype.checkAccess = function(action, usr, level) {
   var deny = null;
   try {
      switch (action) {
         case "main" :
         case "admins" :
         case "managers" :
         case "contributors" :
         case "subscribers" :
         case "create" :
            checkIfLoggedIn(this.href(action));
            this.checkEditMembers(usr, level);
            break;
         case "updated" :
         case "memberships" :
         case "subscriptions" :
         case "edit" :
            checkIfLoggedIn(this.href(action));
            break;
      }
   } catch (deny) {
      res.message = deny.toString();
      res.redirect(this._parent.href());
   }
   return;
};

/**
 * check if user is allowed to edit the memberlist of this site
 * @param Obj Userobject
 * @param Int Permission-Level
 * @return String Reason for denial (or null if allowed)
 */
MemberMgr.prototype.checkEditMembers = function(usr, level) {
   if ((level & MAY_EDIT_MEMBERS) == 0)
      throw new DenyException("memberEdit");
   return;
};
