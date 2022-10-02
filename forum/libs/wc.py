# -*- coding: utf-8 -*-

from wordcloud import WordCloud

def convert_posts_to_wordcloud(posts, *, safe=True):
    contents = ' '.join(post.wakati for post in posts) + 'test' * safe
    svg = WordCloud(font_path='forum/static/font/VL-Gothic-Regular.ttf',
                     background_color='white',
                     width=300,
                     height=300,
                     ).generate(contents).to_svg()
    svg = svg[:5] + 'id="wordcloud-svg"' + svg[4:]
    return svg
