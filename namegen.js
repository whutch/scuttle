
// Requires jQuery

function get_chunks(name) {
    var lead = /^[aeiouy]*(?:qu|[bcdfghjklmnpqrstvwxz])+/;
    var inner = /\B[aeiouy]+(?:qu|[bcdfghjklmnpqrstvwxz])+\B/g;
    var tail = /[aeiouy]+(?:qu|[bcdfghjklmnpqrstvwxz])*$/;
    name = name.toLowerCase();
    return [name.match(lead), name.match(inner), name.match(tail)];
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function make_names(seed_names, amount=10, minimum_count=0, allow_short=true) {
    // Build our lists of usable chunks first.
    var lead_chunks = {}, inner_chunks = {}, tail_chunks = {};
    $.each(seed_names, function(index, name) {
        var chunk;
        var chunks = get_chunks(name);
        if (chunks[0]) {
            chunk = chunks[0][0];
            lead_chunks[chunk] = (lead_chunks[chunk] || 0) + 1;
        }
        if (chunks[1]) {
            $.each(chunks[1], function(index, chunk) {
                inner_chunks[chunk] = (inner_chunks[chunk] || 0) + 1;
            });
        }
        if (chunks[2]) {
            chunk = chunks[2][0];
            tail_chunks[chunk] = (tail_chunks[chunk] || 0) + 1;
        }
    });
    var leads = [], inners = [], tails = [];
    $.each(lead_chunks, function(chunk, count) {
        if (count >= minimum_count) {
            leads.push(chunk)
        }
    });
    $.each(inner_chunks, function(chunk, count) {
        if (count >= minimum_count) {
            inners.push(chunk)
        }
    });
    $.each(tail_chunks, function(chunk, count) {
        if (count >= minimum_count) {
            tails.push(chunk)
        }
    });
    // We've got our lists, now we can build us some names!
    var names = [];
    for (var i = 0; i < amount; i++) {
        var random_inners = randint(0, 1)
        random_inners += Number(!allow_short)
        if (Math.random() > 0.85) {
            random_inners += 1
        }
        var name = leads[randint(0, leads.length - 1)];
        for (var j = 0; j < random_inners; j++) {
            name += inners[randint(0, inners.length - 1)];
        }
        name += tails[randint(0, tails.length - 1)];
        name = name.charAt(0).toUpperCase() + name.slice(1);
        names.push(name);
    }
    return names;
}
