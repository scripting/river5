# river5
PlanetGSoC uses river5 as it's river-of-news RSS aggregator which is written in NodeJS.

[![DEPLOY ON OpenShift](http://launch-shifter.rhcloud.com/launch/DEPLOY ON.svg)](https://openshift.redhat.com/app/console/application_type/custom?&cartridges[]=nodejs-0.10&initial_git_url=https://github.com/planetGSoC/river5.git&name=river5-planetGSoC)

## How to add your blog to http://planetgsoc.github.io/

You can add your Blog's feed to the [list/gsoc.txt](https://github.com/planetGSoC/river5/blob/master/lists/gsoc.txt). Please try to add blogs that are related to Google Summer of Code or you can read below to add tags/labels to your blog and get it's feed.

### Jekyll Powered Blogs

Jekyll allows you to add tags to your blogs. After adding tags it is as easy as adding the following feed generator for that tag.

You can add tags by adding this to the YAML: 

```yaml
---
layout: post
title: Participating in Google Summer of Code 2016
tags:
- gsoc
---

Blog Content...

```

And then simply add the following file and save it as `feed-gsoc.xml`.

```xml
---
layout: null
---
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{{ site.title | xml_escape }}</title>
    <description>{{ site.description | xml_escape }}</description>
    <link>{{ site.url }}{{ site.baseurl }}/</link>
    <atom:link href="{{ "/feed-gsoc.xml" | prepend: site.baseurl | prepend: site.url }}" rel="self" type="application/rss+xml"/>
    <pubDate>{{ site.time | date_to_rfc822 }}</pubDate>
    <lastBuildDate>{{ site.time | date_to_rfc822 }}</lastBuildDate>
    <generator>Jekyll v{{ jekyll.version }}</generator>
    {% for post in site.tags.gsoc limit:10 %}
      <item>
        <title>{{ post.title | xml_escape }}</title>
        <description>{{ post.content | xml_escape }}</description>
        <pubDate>{{ post.date | date_to_rfc822 }}</pubDate>
        <link>{{ post.url | prepend: site.baseurl | prepend: site.url }}</link>
        <guid isPermaLink="true">{{ post.url | prepend: site.baseurl | prepend: site.url }}</guid>
	{% for tag in post.tags %}<category term="{{ tag }}"/>{% endfor %}
        {% for tag in page.tags %}
        <category>{{ tag | xml_escape }}</category>
        {% endfor %}
        {% for cat in page.categories %}
        <category>{{ cat | xml_escape }}</category>
        {% endfor %}
      </item>
    {% endfor %}
  </channel>
</rss>
```

Finally, you can add the link (`http://rhnvrm.github.io/feed-gsoc.xml`) to [list/gsoc.txt](https://github.com/planetGSoC/river5/blob/master/lists/gsoc.txt) in a new line.

### Blogger/Blogspot powered

You can add a label named `GSoC` to your blog and the feed for that specific tag will reside in `blog.com/feeds/posts/default/-/GSoC/?alt=rss`. You can then add this to [list/gsoc.txt](https://github.com/planetGSoC/river5/blob/master/lists/gsoc.txt) in a new line.


### Wordpress powered

Feed for Wordpress blogs can be generated at `http://www.example.com/?tag=tagname&feed=rss2` or `http://example.in/feed/?cat=gsoc-2016`. You can read up the documentation here: `https://codex.wordpress.org/WordPress_Feeds#Categories_and_Tags`. Add this in a new line to [list/gsoc.txt](https://github.com/planetGSoC/river5/blob/master/lists/gsoc.txt)

## Workflow for deploying your own planet

1. Deploy river5 on openshift
2. Update the URL in github.io repository
3. To add new feeds to the river, add it to [list/gsoc.txt](https://github.com/planetGSoC/river5/blob/master/lists/gsoc.txt) and push the commit to openshift using git and let it redeploy.
