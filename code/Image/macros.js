/**
 * macro rendering alias of image
 */

function alias_macro(param) {
   if (param.as == "editor")
      renderInputText(this.createInputParam("alias",param));
   else
      res.write(this.alias);
}


/**
 * macro rendering alternate text of image
 */

function alttext_macro(param) {
   if (param.as == "editor")
      renderInputText(this.createInputParam("alttext",param));
   else
      res.write(this.alttext);
}

/**
 * macro renders the width of the image
 */

function width_macro(param) {
   res.write(this.width);
}

/**
 * macro renders the height of the image
 */

function height_macro(param) {
   res.write(this.height);
}

/**
 * macro renders the url to this image
 */

function url_macro(param) {
   res.write(getProperty("imgUrl"));
   if (this.site)
       res.write(this.site.alias + "/");
   res.write(this.filename + "." + this.fileext);
}


/**
 * macro renders a link for editing image
 */

function editlink_macro(param) {
   if (session.user && !this.isEditDenied(session.user)) {
      openLink(this.href("edit"));
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "edit");
      closeLink();
   }
}

/**
 * macro rendering a link to delete
 * if user is creator of this image
 */

function deletelink_macro(param) {
   if (session.user && !this.isEditDenied(session.user)) {
      openLink(this.href("delete"));
      if (param.image && this.site.images.get(param.image))
         this.site.renderImage(this.site.images.get(param.image),param);
      else
         res.write(param.text ? param.text : "delete");
      closeLink();
   }
}

/**
 * macro renders the image-tag
 * link to main if thumbnail
 */

function show_macro(param) {
   var img = this;
   // if we have a thumbnail, display that
   if (param.what == "thumbnail" && this.thumbnail) 
      img = this.thumbnail;
   param.src = img.getStaticUrl();
   openLink(this.href());
   renderImage(img, param);
   closeLink();
}


/**
 * macro renders "yes" if this image has a thumbnail
 */

function hasthumbnail_macro(param) {
   if (this.thumbnail)
      res.write("yes");
   else
      res.write("no");
}
