
function ready(fn) {
	if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}


function showAlert(message) {
	document.getElementById("comment-form-notice").classList.remove("hidden");
	document.getElementById("comment-form-notice-text").innerHTML = message;
}

ready(function() {
	var form = document.getElementById("comment-form");
	
	form.onsubmit = function(event) {
		event.preventDefault();
		
		form.classList.add("disabled");
		document.getElementById("comment-form-submit").innerHTML = '<svg class="icon spin"><use xlink:href="#icon-loading"></use></svg> Loading...';

		var request = new XMLHttpRequest();
		request.open('POST', form.action, true);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		request.onload = function() {
			if (this.status >= 200 && this.status < 400) {
				document.getElementById("comment-form-submit").innerHTML = 'Submitted';
				document.getElementById("comment-form-submit").classList.add("btn--disabled");
				
				var notice_classes = document.getElementById("comment-form-notice").classList;
				notice_classes.add("notice--success");
				notice_classes.remove("notice--danger");
				showAlert('<strong>Thanks for your comment!</strong> It will show on the site once it has been reviewed and approved.');
		    
			} else {
				// We reached our target server, but it returned an error
				console.log(err);
				document.getElementById("comment-form-submit").innerHTML = 'Submit Comment';
				document.getElementById("comment-form-submit").classList.add("btn--disabled");
				
				var notice_classes = document.getElementById("comment-form-notice").classList;
				notice_classes.remove("notice--success");
				notice_classes.add("notice--danger");
				showAlert('<strong>Sorry, there was an error with your submission.</strong> Please make sure all required fields have been completed and try again.');
				form.classList.remove('disabled');
			}
		};

		request.onerror = function() {
				// We reached our target server, but it returned an error
				console.log(err);
				document.getElementById("comment-form-submit").innerHTML = 'Submit Comment';
				document.getElementById("comment-form-submit").classList.add("btn--disabled");
				
				var notice_classes = document.getElementById("comment-form-notice").classList;
				notice_classes.remove("notice--success");
				notice_classes.add("notice--danger");
				showAlert('<strong>Sorry, there was an error with your submission.</strong> Please make sure all required fields have been completed and try again.');
				form.classList.remove('disabled');
		};

		request.send(new URLSearchParams(new FormData(form)).toString());
		
		return false;
	}
});

// Staticman comment replies
// modified from Wordpress https://core.svn.wordpress.org/trunk/wp-includes/js/comment-reply.js
var addComment = {
  moveForm: function( commId, parentId, respondId, postId ) {
    var div, element, style, cssHidden,
      t           = this,
      comm        = t.I( commId ),
      respond     = t.I( respondId ),
      cancel      = t.I( 'cancel-comment-reply-link' ),
      parent      = t.I( 'comment-replying-to' ),
      post        = t.I( 'comment-post-id' ),
      commentForm = respond.getElementsByTagName( 'form' )[0];

    if ( ! comm || ! respond || ! cancel || ! parent || ! commentForm ) {
  alert("fooo");
      return;
    }

    t.respondId = respondId;
    postId = postId || false;

    if ( ! t.I( 'sm-temp-form-div' ) ) {
      div = document.createElement( 'div' );
      div.id = 'sm-temp-form-div';
      div.style.display = 'none';
      respond.parentNode.insertBefore( div, respond );
    }

    comm.parentNode.insertBefore( respond, comm.nextSibling );
    if ( post && postId ) {
      post.value = postId;
    }
    parent.value = parentId;
    cancel.style.display = '';

    cancel.onclick = function() {
      var t       = addComment,
        temp    = t.I( 'sm-temp-form-div' ),
        respond = t.I( t.respondId );

      if ( ! temp || ! respond ) {
        return;
      }

      t.I( 'comment-replying-to' ).value = '';
      temp.parentNode.insertBefore( respond, temp );
      temp.parentNode.removeChild( temp );
      this.style.display = 'none';
      this.onclick = null;
      return false;
    };

    /*
     * Set initial focus to the first form focusable element.
     * Try/catch used just to avoid errors in IE 7- which return visibility
     * 'inherit' when the visibility value is inherited from an ancestor.
     */
    try {
      for ( var i = 0; i < commentForm.elements.length; i++ ) {
        element = commentForm.elements[i];
        cssHidden = false;

        // Modern browsers.
        if ( 'getComputedStyle' in window ) {
          style = window.getComputedStyle( element );
        // IE 8.
        } else if ( document.documentElement.currentStyle ) {
          style = element.currentStyle;
        }

        /*
         * For display none, do the same thing jQuery does. For visibility,
         * check the element computed style since browsers are already doing
         * the job for us. In fact, the visibility computed style is the actual
         * computed value and already takes into account the element ancestors.
         */
        if ( ( element.offsetWidth <= 0 && element.offsetHeight <= 0 ) || style.visibility === 'hidden' ) {
          cssHidden = true;
        }

        // Skip form elements that are hidden or disabled.
        if ( 'hidden' === element.type || element.disabled || cssHidden ) {
          continue;
        }

        element.focus();
        // Stop after the first focusable element.
        break;
      }

    } catch( er ) {}

    return false;
  },

  I: function( id ) {
    return document.getElementById( id );
  }
};

