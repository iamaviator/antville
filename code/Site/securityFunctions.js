/**
 * check if site is online
 * @param Obj Userobject
 * @return String String indicating that site is not public (or null if public)
 */

function isNotPublic(usr) {
   if (!this.online) {
      if (usr && usr.sysadmin)
         return null;
      else if (req.data.memberlevel)
         return null;
      return "siteNotPublic";
   }
   return null;

}

/**
 * check if user is allowed to edit the preferences of this site
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isEditDenied(usr) {
   if (usr.sysadmin)
      return null;
   if ((req.data.memberlevel & MAY_EDIT_PREFS) == 0)
      return "siteEditDenied";
   return null;
}

/**
 * check if user is allowed to delete the site
 * (only SysAdmins or the creator of a site are allowed to delete it!)
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isDeleteDenied(usr) {
   if (!usr.sysadmin && usr != this.creator)
      return "siteDeleteDenied";
   return null;
}

/**
 * function checks if user is allowed to sign up
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isSubscribeDenied(usr) {
   if (req.data.memberlevel)
      return "subscriptionExist";
   else if (!this.online)
      return "siteNotPublic";
   return null;
}

/**
 * check if user is allowed to unsubscribe
 * @param Obj Userobject
 * @return String Reason for denial (or null if allowed)
 */

function isUnsubscribeDenied(usr) {
   if (req.data.memberlevel)
      return "subscriptionNoExist";
   else if (req.data.memberlevel > 0)
      return "unsubscribeDenied";
   return null;
}

