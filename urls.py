
from django.conf.urls import patterns, include, url
from django.contrib import admin

from mezzanine.core.views import direct_to_template
from django.contrib.auth import views as auth_views

admin.autodiscover()

# Add the urlpatterns for any custom Django applications here.
# You can also change the ``home`` view to add your own functionality
# to the project's homepage.

urlpatterns = patterns("",

    #riverwatch image pages
    url(r'^image/(?P<img_id>\d+)/$', 'riverwatch.views.image'),
    # Custom riverwatch image pages - submit
    url("^submit/", 'riverwatch.views.submit'),
    url(r'^image/submission_details/$', 'riverwatch.forms.submission_details'),
    
    
  
    url(r'^logout/$', 'django.contrib.auth.views.logout',
                          {'next_page': '/'}),
    
    url(r'^gallery/', 'riverwatch.views.imggallery'),
    
    
    #Approval - Images
    url(r'^approve/$','riverwatch.views.approve_images'),
    url(r'^approve/(?P<img_id>\d+)/$','riverwatch.views.approve'),
    url(r'^reject/(?P<img_id>\d+)/$','riverwatch.views.reject'),
    
    #custom riverwatch - view
    url(r'^image/(?P<img_id>\d+)/$', 'riverwatch.views.image'),
    url(r'^add_tag/$', 'riverwatch.views.add_tag'),
    url(r'^map/$','riverwatch.views.maps'),
    url(r'^accounts/profile/$','riverwatch.views.images_for_user'),
    
    #JSON Export
    #url(r'^api/export/$', 'riverwatch.rest.export'),
    #Mobile App Submissions
    url(r'^api/image/$', 'riverwatch.rest.image'),
    url(r'^api/image$', 'riverwatch.rest.image'),
    
    #Stop Django overriding registration default urls
    url(r'^password/change/$',
                    auth_views.password_change,
                    name='password_change'),
    url(r'^password/change/done/$',
                    auth_views.password_change_done,
                    name='password_change_done'),
    url(r'^password/reset/$',
                    auth_views.password_reset,
                    name='password_reset'),
    url(r'^password/reset/done/$',
                    auth_views.password_reset_done,
                    name='password_reset_done'),
    url(r'^password/reset/complete/$',
                    auth_views.password_reset_complete,
                    name='password_reset_complete'),
    #url(r'^password/reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>.+)/$', auth_views.password_reset_confirm, name='password_reset_confirm'),

    #Reg
    (r'^accounts/', include('registration.backends.default.urls')),

    #Captcha URLS
    url(r'^captcha/', include('captcha.urls')),

    # Change the admin prefix here to use an alternate URL for the
    # admin interface, which would be marginally more secure.
    ("^admin/", include(admin.site.urls)),

    # We don't want to presume how your homepage works, so here are a
    # few patterns you can use to set it up.

    # HOMEPAGE AS STATIC TEMPLATE
    # ---------------------------
    # This pattern simply loads the index.html template. It isn't
    # commented out like the others, so it's the default. You only need
    # one homepage pattern, so if you use a different one, comment this
    # one out.

    url("^$", 'riverwatch.views.homepage', name="home"),

    # HOMEPAGE AS AN EDITABLE PAGE IN THE PAGE TREE
    # ---------------------------------------------
    # This pattern gives us a normal ``Page`` object, so that your
    # homepage can be managed via the page tree in the admin. If you
    # use this pattern, you'll need to create a page in the page tree,
    # and specify its URL (in the Meta Data section) as "/", which
    # is the value used below in the ``{"slug": "/"}`` part. Make
    # sure to uncheck "show in navigation" when you create the page,
    # since the link to the homepage is always hard-coded into all the
    # page menus that display navigation on the site. Also note that
    # the normal rule of adding a custom template per page with the
    # template name using the page's slug doesn't apply here, since
    # we can't have a template called "/.html" - so for this case, the
    # template "pages/index.html" can be used.

    # url("^$", "mezzanine.pages.views.page", {"slug": "/"}, name="home"),

    # HOMEPAGE FOR A BLOG-ONLY SITE
    # -----------------------------
    # This pattern points the homepage to the blog post listing page,
    # and is useful for sites that are primarily blogs. If you use this
    # pattern, you'll also need to set BLOG_SLUG = "" in your
    # ``settings.py`` module, and delete the blog page object from the
    # page tree in the admin if it was installed.

    # url("^$", "mezzanine.blog.views.blog_post_list", name="home"),

    # MEZZANINE'S URLS
    # ----------------
    # ADD YOUR OWN URLPATTERNS *ABOVE* THE LINE BELOW.
    # ``mezzanine.urls`` INCLUDES A *CATCH ALL* PATTERN
    # FOR PAGES, SO URLPATTERNS ADDED BELOW ``mezzanine.urls``
    # WILL NEVER BE MATCHED!

    # If you'd like more granular control over the patterns in
    # ``mezzanine.urls``, go right ahead and take the parts you want
    # from it, and use them directly below instead of using
    # ``mezzanine.urls``.
    ("^", include("mezzanine.urls")),

    # MOUNTING MEZZANINE UNDER A PREFIX
    # ---------------------------------
    # You can also mount all of Mezzanine's urlpatterns under a
    # URL prefix if desired. When doing this, you need to define the
    # ``SITE_PREFIX`` setting, which will contain the prefix. Eg:
    # SITE_PREFIX = "my/site/prefix"
    # For convenience, and to avoid repeating the prefix, use the
    # commented out pattern below (commenting out the one above of course)
    # which will make use of the ``SITE_PREFIX`` setting. Make sure to
    # add the import ``from django.conf import settings`` to the top
    # of this file as well.
    # Note that for any of the various homepage patterns above, you'll
    # need to use the ``SITE_PREFIX`` setting as well.

    # ("^%s/" % settings.SITE_PREFIX, include("mezzanine.urls"))

)

# Adds ``STATIC_URL`` to the context of error pages, so that error
# pages can use JS, CSS and images.
handler500 = "mezzanine.core.views.server_error"
