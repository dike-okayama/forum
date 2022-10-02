# -*- coding: utf-8 -*-

import pandas as pd

from janome.tokenizer import Tokenizer
from janome.analyzer import Analyzer
from janome.charfilter import UnicodeNormalizeCharFilter
from janome.tokenfilter import POSKeepFilter, POSStopFilter, LowerCaseFilter


def token_to_wakati(tokens):
    return (t.base_form for t in tokens)


def score_text(document):
    return dic["+切片"] +\
           sum(dic.get(e, 0) for e in token_to_wakati(analyzer.analyze(document)))

def focus_emotional_words(text):
    tag = ''
    for token in tokenizer.tokenize(text):
        if token.part_of_speech.startswith(('名詞', '形容詞')) and token.base_form in dic:
            tag += '<nobr class="border-animation">' + token.surface + '</nobr>'
        else:
            tag += token.surface
    return tag

def convert_text_to_wakati(text):

    wakati = []
    for token in tokenizer.tokenize(text):
        if any(token.part_of_speech.startswith(e) for e in ('動詞', '名詞')):
            wakati.append(token.base_form)

    return ' '.join(wakati)


tokenizer = Tokenizer()

token_filters = [
    POSKeepFilter([
        '名詞',
        '形容詞',
    ]),
    POSStopFilter([
        '名詞, 数',
        '名詞, 代名詞',
        '名詞, 非自立',
        '名詞, 接頭',
        '名詞, 接尾',
    ]),
    LowerCaseFilter(),
]

char_filters = [
    UnicodeNormalizeCharFilter(),
]

stopwords = []

analyzer = Analyzer(char_filters=char_filters,
                    tokenizer=tokenizer,
                    token_filters=token_filters
                    )


df = pd.read_csv("forum/model/emotion_model.csv")

dic = dict(df[['name', 'score']].values)
