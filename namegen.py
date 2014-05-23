import re
import random


def token_lists(names, cull=1,
                # Match 0 or more vowels + 1 or more consonants at the start of the word
                lead=r"^[aeiouy]*(?:qu|[bcdfghjklmnpqrstvwxz])+",
                # Match 1 or more vowels + 1 or more consonants inside a word (not start/end)
                inner=r"\B[aeiouy]+(?:qu|[bcdfghjklmnpqrstvwxz])+\B",
                # Match 1 or more vowels + 0 or more consonats at the end of a word
                trail=r"[aeiouy]+(?:qu|[bcdfghjklmnpqrstvwxz])*$"):
    lead = re.compile(lead)
    inner = re.compile(inner)
    trail = re.compile(trail)
    leads, inners, tails = {}, {}, {}
    # Populate dictionaries; key=pattern, value=frequency
    for name in names:
        name = name.lower()
        match = re.match(lead, name)
        if match:
            pat = match.group(0)
            count = leads.get(pat, 0)
            leads[pat] = count + 1
        matches = re.findall(inner, name)
        for pat in matches:
            count = inners.get(pat, 0)
            inners[pat] = count + 1
        match = re.search(trail, name)
        if match:
            pat = match.group(0)
            count = tails.get(pat, 0)
            tails[pat] = count + 1
    # Convert dicts to a list of tuples in the format (pattern, frequency)
    sort_key = lambda x: x[1]
    lead_srt = sorted(leads.items(), key=sort_key, reverse=True)
    inner_srt = sorted(inners.items(), key=sort_key, reverse=True)
    tail_srt = sorted(tails.items(), key=sort_key, reverse=True)
    # Build lists of patterns ordered most to least frequent and cull rares
    lead_list = [ x[0] for x in lead_srt if x[1] > cull ]
    inner_list = [ x[0] for x in inner_srt if x[1] > cull ]
    tail_list = [ x[0] for x in tail_srt if x[1] > cull ]
    return lead_list, inner_list, tail_list


def make_names(leads, inners, tails, amount=10):
    names = []
    for i in xrange(amount):
        syllables = random.randint(0,1)
        if random.random() > .85:
            syllables += 1
        name = random.choice(leads)
        for x in range(syllables):
            name += random.choice(inners)
        name += random.choice(tails)
        names.append(name.title())
    return names
