from django.template import RequestContext
from riverwatch.models import Image, ImageComment, Tag
from riverwatch.forms import ContactForm, SubmitForm
from django.core.context_processors import csrf
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import logout as internal_logout
from django.contrib.auth.models import User
from django.shortcuts import render, render_to_response
from django.template import Context, loader
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.sites.models import get_current_site


from datetime import datetime
from django.utils.timezone import utc
import math
import json
import search_utils
import rest
import geofilter
import tag_utils
import os
import base64
import random


def imggallery(request):
    images = Image.objects.order_by('-submission_date').filter(is_approved=True)[0:10000]
    return render_to_response('riverwatch/gallery.html', {'images':images}, context_instance = RequestContext(request))

def approve(request, img_id):
    """
    If the user object processed for this request context is a staff member,
    then the image with corresponding ID will have its is_approved field set
    to true.
    """
    if not request.user.is_staff:
        return HttpResponseRedirect(reverse('riverwatch.views.composite'))
    else:
        image = Image.objects.get(pk=img_id)
        image.is_approved=True
        image.save()
        return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
def reject(request, img_id):
    """
    If the request context's user is staff, then the image with given
    ID be erased (i.e. form disc and database)
    """
    if not request.user.is_staff:
        return HttpResponseRedirect(reverse('riverwatch.views.composite'))
    else:
        img = Image.objects.get(id=img_id)
        os.remove(os.path.join(settings.STATIC_ROOT, "uploaded-images/%s.%s" % (img.image_path, img.extension)))
        os.remove(os.path.join(settings.STATIC_ROOT, "uploaded-images/%s-thumb.%s" % (img.image_path, img.extension)))
        img.delete()
        return HttpResponseRedirect(reverse('riverwatch.views.approve_images'))

def approve_images(request):
    """
    Open the tab where you can approve images
    """
    if not request.user.is_staff and not request.user.has_perm("approve-images"):
        return HttpResponseRedirect(reverse('home'))
    else:
        images = Image.objects.order_by('-submission_date').filter(is_approved=False)[0:10]
        ctx = {"images":images}
        return render_to_response('riverwatch/approve_images.html',ctx, context_instance = RequestContext(request))


def add_tag(request):
    """
    Adds a tag onto an image. Currently only accessible from an individual
    image page. This shares a lot of characteristics with adding a comment and
    could be generalised a bit better.
    """
    print 'Entered Method'
    if request.method != 'POST':
        print 'Not a post Request'
        return HttpResponseRedirect("/")

    else:
        print 'Post request made for add tag'
        # print request
        try:            
            img_id = request.POST['id']
            img = Image.objects.get(pk=img_id)
        except:
            # return HttpResponseRedirect(reverse('riverwatch.views.composite'))
            return HttpResponseRedirect("/");
        tag_val = request.POST['tag']
        print tag_val
        try:
        	for tag in tag_utils.TagsFromText(tag_val):
        		img.tags.add(tag)
        	img.save()
        	added = True
        except:
            added = False

        resp = rest.rest_success(request, img_id)
        respJson = json.loads(resp.content)
        respJson['added'] = added
        resp.content = json.dumps(respJson)
        return resp


def image(request, img_id):
    """
    Returns a page displaying a single image, along with all associated comments, tags, and votes.
    """
    image = Image.objects.get(pk=img_id)
    if request.user.is_staff or image.is_approved:

        ctx = {"img":image,
               "image_tags":image.tags.all(),
               "all_tags":Tag.objects.all(),
               "site":get_current_site(request)
              }
        return render_to_response('riverwatch/image.html', ctx , context_instance = RequestContext(request))
    else:
        return HttpResponseRedirect(reverse('home'))



def images_for_user(request):
    """
    A helper/potentially entirely redundant function that returns all of a users images, accessed from
    the 'display your images' drop down option
    """
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('home'))
    else:

      images = Image.objects.filter(submitter_id = request.user.id).filter(is_approved=True)[0:10000]
      points = [search_utils.to_map_point(image) for image in images]

      notApprovedImages = Image.objects.filter(submitter_id = request.user.id).filter(is_approved=False)[0:10000]
      unapproved = [search_utils.to_map_point(image) for image in notApprovedImages]

      print points  
      return render_to_response('riverwatch/profile.html', {'images':images,"latLngs":points,'unapproved':unapproved} , context_instance = RequestContext(request))




def search(request):
    """
    Searches images for the following possible criteria:
        * Date time | all images between two dates
        * Location  | all images within one to many 'geofilters' which are a lat/lng point and radius
        * Tag       | all images matching either all, or at least one, tag, depending on the search conjunctivity
    Currently returns map points, as it's only used by Maps, but is searching images then transforming them,
    so could easily be factored more generally (indeed, it probably should...) 
    """
    #TODO - move these into a better/more extensible location
    geofiltered = []
    datefiltered = []
    tagfiltered = []

    if request.POST["geo_filter"] == "true":
        f_count = request.POST["filters"]
        filters = []
        for i in xrange(int(f_count)):
            filters.append(geofilter.Geofilter(i, request.POST["filter_"+str(i)+"_rad"], request.POST["filter_"+str(i)+"_lat"], request.POST["filter_"+str(i)+"_lng"]))
        imgs = Image.objects.filter(is_approved = True)
        for gfilter in filters:
            search_result = search_utils.filter_location(gfilter, imgs)        
            geofiltered = set(geofiltered).union(search_result)

    if request.POST["date_filter"] == "true":    
        date_from = datetime.strptime(request.POST["from"], "%d/%m/%Y")
        date_to = datetime.strptime(request.POST["to"], "%d/%m/%Y")
        datefiltered.extend(search_utils.filter_date(date_from, date_to))

    if request.POST["tag_filter"] == "true":
        tags = [x for x in request.POST["tags"].split(',') if x]
        for img in Image.objects.filter(is_approved = True):
            tag_matches = map((lambda t : t in [x.tag_text for x in img.tags.all()]), tags)
            if len(tag_matches) == 0: continue
            conjunctive = request.POST["conjunctive"] == 'true'
            if(conjunctive and all(tag_matches)):
                tagfiltered.append(img)
            elif(not conjunctive and any(tag_matches)):
                tagfiltered.append(img)
        print tagfiltered           

    latlngs = Image.objects.filter(is_approved = True)
    #TODO - refactor meeeeee
    if len(geofiltered) > 0: latlngs = set(latlngs).intersection(set(geofiltered))
    if len(datefiltered) > 0: latlngs = set(latlngs).intersection(set(datefiltered))
    if len(tagfiltered) > 0: latlngs = set(latlngs).intersection(set(tagfiltered))
    if len(geofiltered) + len(datefiltered) + len(tagfiltered) == 0: latlngs = []
    respDict = {}
    points = [search_utils.to_map_point(image) for image in latlngs]
 
    respDict["points"] = points

    resp = HttpResponse(json.dumps(respDict), "application/json", 200)
    return resp


'''
Login requred non-ajax accessible pages
'''
#@login_required
def submit(request):
    """
    Saves the uploaded image to a temporary location, and redirects the user
    to a details page, where they fill in name, tags, geolocation, and so on.
    """
    if request.POST:
        form = SubmitForm(request.POST, request.FILES)
        if form.is_valid():
            image = request.FILES['imagefile']
            extension = image.name.split('.')[1]
            hashname = random.getrandbits(128)
            with open(os.path.join(settings.STATIC_ROOT, "tmp/%s.%s" % (hashname, extension)), "w+") as imagePath:
                imagePath.write(image.read())
            ctx = RequestContext(request, {"hash":hashname, "extension":extension, "all_tags":Tag.objects.all()})
            template = loader.get_template("riverwatch/submission_details.html")

            return HttpResponse(template.render(ctx))
    else:
        form = SubmitForm()

    return render_to_response("riverwatch/submit.html", dict(form=form), context_instance = RequestContext(request))


def maps(request):
    """
    Converts all images into google maps compatible points, and renders the map
    """
    #convert image locations to google maps parsable points
    now = datetime.utcnow().replace(tzinfo=utc)

    notApprovedImages = Image.objects.order_by('-submission_date').filter(is_approved=False)[0:10000]
    unapproved = [search_utils.to_map_point(image) for image in notApprovedImages]

    latlngs = search_utils.filter_date(search_utils.min_date, now)
    points = [search_utils.to_map_point(image) for image in latlngs]
    
    #load the search form sidebar
    # t = loader.get_template("riverwatch/search_form.html")
    # ctx = Context({})
    # search_form = t.render(ctx)

    return render_to_response('riverwatch/mappage.html', {"latLngs":points, "unapproved":unapproved, "all_tags":Tag.objects.all(),}, context_instance = RequestContext(request))
    
def homepage(request):
    now = datetime.utcnow().replace(tzinfo=utc)
    latlngs = search_utils.filter_date(search_utils.min_date, now)
    points = [search_utils.to_map_point(image) for image in latlngs]
    return render_to_response('index.html', {"latLngs":points}, context_instance = RequestContext(request))
