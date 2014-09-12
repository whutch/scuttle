//  Scuttle v0.2.3 (https://github.com/whutch/scuttle)
//  Copyright 2014 Will Hutcheson
//  Licensed under MIT (https://github.com/whutch/scuttle/blob/master/LICENSE)

//  The basic premise of this was based on the
//    blog post "Random Name Generation" by Jim Storch:
//   http://bogboa.blogspot.com/2009/12/random-name-generation.html
//   (it's nicer in Python)

// Globals
chunks = [{}, {}, {}];
include = [[], [], []];
exclude = [[], [], []];
results = [];

// A big ol' block o' names
presets = {
    "default": "Alex Bobby Charlie Doug Edward Francis Gabriel Harold Ian James Kevin Larry Michael Nathan Oswald Peter Quincy Romeo Stephen Travis Usher Victor William Xavier Yancy Zack",
    "en-male": "english men",
    "en-female": "english women",
    "me-hobbits": "me hobbits",
    "me-men": "me men",
    "me-dwarves": "me dorfs",
    "me-elves": "me elfmans",
    "me-various": "me mixed",
    "got-male": "got dudes?",
    "got-female": "got dames?",
    "hp-male": "hp boys",
    "hp-female": "hp ladiez",
};

// Because JavaScript doesn't have this??
function random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function get_chunks_from_name(name) {
    var lead = /^[aeiouy]*(?:qu|[bcdfghjklmnpqrstvwxz])+/;
    var inner = /\B[aeiouy]+(?:qu|[bcdfghjklmnpqrstvwxz])+\B/g;
    var tail = /[aeiouy]+(?:qu|[bcdfghjklmnpqrstvwxz])*$/;
    name = name.toLowerCase();
    return [name.match(lead), name.match(inner), name.match(tail)];
}

function make_chunks(seed_names) {
    if (seed_names.length < 1) {
        return;
    }
    $.each(seed_names, function(index, name) {
        var new_chunks = get_chunks_from_name(name);
        var chunk;
        if (new_chunks[0]) {
            chunk = new_chunks[0][0];
            chunks[0][chunk] = (chunks[0][chunk] || 0) + 1;
        }
        if (new_chunks[1]) {
            $.each(new_chunks[1], function(index, chunk) {
                chunks[1][chunk] = (chunks[1][chunk] || 0) + 1;
            });
        }
        if (new_chunks[2]) {
            chunk = new_chunks[2][0];
            chunks[2][chunk] = (chunks[2][chunk] || 0) + 1;
        }
    });
}

function update_chunk_list(list_id, new_chunks) {
    var html = "";
    $.each(new_chunks, function(chunk, count) {
        html += '<tr><td><span class="chunk">' + chunk + "</span></td><td>" + count + "</td></tr>";
    });
    if (html == "") {
        html = "<tr><td colspan=2><i>None</i></td></tr>";
    }
    $("#" + list_id).html(html);
}

function update_chunk_lists() {
    update_chunk_list("leads-list", chunks[0]);
    update_chunk_list("inners-list", chunks[1]);
    update_chunk_list("tails-list", chunks[2]);
}

function make_chunk_pool(chunk_type, min_frequency) {
    var pool = [];
    $.each(chunks[chunk_type], function(chunk, count) {
        if (include[chunk_type].length) {
            if (include[chunk_type].indexOf(chunk) < 0) {
                return;
            }
        }
        else if (exclude[chunk_type].indexOf(chunk) >= 0) {
            return;
        }
        if (count >= min_frequency) {
            pool.push(chunk);
        }
    });
    return pool;
}

function make_names(amount, min_inner, min_frequency, weighted) {
    amount = typeof amount != 'undefined' ? amount : 10;
    min_inner = typeof min_inner != 'undefined' ? min_inner : 0;
    min_frequency = typeof min_frequency != 'undefined' ? min_frequency : 1;
    weighted = typeof weighted != 'undefined' ? weighted : false;
    // Build our chunks pools based on the given options
    var lead_pool = make_chunk_pool(0, min_frequency);
    var inner_pool = make_chunk_pool(1, min_frequency);
    var tail_pool = make_chunk_pool(2, min_frequency);
    // Make sure we've got enough chunks to work with
    if (lead_pool.length < 1 || tail_pool.length < 1) {
        return [];
    }
    if (min_inner > 0 && inner_pool.length < 1) {
        return [];
    }
    // We're good, now make us some names!
    var new_names = [];
    // todo: filtering duplicate names
    for (var i = 0; i < amount; i++) {
        // 50% chance of 1 inner chunk (3 total with lead and tail)
        var random_inners = random_int(0, 1);
        // 15% chance of another inner chunk (4 total)
        if (Math.random() > 0.85) {
            random_inners += 1;
        }
        // Make sure we've got enough
        random_inners = Math.max(random_inners, min_inner);
        // Now make a name!
        var lead_used = lead_pool[random_int(0, lead_pool.length - 1)];
        var name = lead_used;
        var inners_used = [];
        for (var j = 0; j < random_inners; j++) {
            inners_used.push(inner_pool[random_int(0, inner_pool.length - 1)]);
        }
        name += inners_used.join("");
        var tail_used = tail_pool[random_int(0, tail_pool.length - 1)]
        name += tail_used;
        name = name.charAt(0).toUpperCase() + name.slice(1);
        name_array = [name, lead_used, inners_used, tail_used];
        results.push(name_array);
        new_names.push(name_array);
    }
    return new_names;
}

function update_results_list() {
    var html = "";
    $.each(results, function(index, name_array) {
        name = name_array[0];
        html += "<tr><td>" + name + "</td><td>";
        html += '<span class="chunk">' + name_array[1] + "</span>";
        $.each(name_array[2], function(chunk_index, chunk) {
            html += '<span class="chunk">' + chunk + "</span>";
        });
        html += '<span class="chunk">' + name_array[3] + "</span>";
        html += "</td></tr>";
    });
    if (html == "") {
        html = "<tr><td colspan=2><i>None, generate some!</i></td></tr>";
    }
    $("#results-list").html(html);
}

// Form processing stuff

function change_preset(event) {
    var names = presets[$(this).val()];
    if (names != "") {
        $("#seed-names").val(names);
    }
}

function click_add_chunks(event) {
    var seed_names = $("#seed-names").val()
                                     .replace(/[\t\n\r]/g, " ")
                                     .replace(/ +/g, " ");
    seed_names = $.trim(seed_names).split(" ");
    if (seed_names.length < 1 || seed_names[0] == "") {
        return;
    }
    make_chunks(seed_names);
    update_chunk_lists();
}

function click_clear_chunks(event) {
    chunks = [{}, {}, {}];
    include = [[], [], []];
    exclude = [[], [], []];
    update_chunk_lists();
}

function click_chunk(event) {
    span = $(this);
    chunk_type = span.parents("table").data("chunk-type");
    chunk = span.text();
    if (span.hasClass("include")) {
        // Cycle to exclude
        include[chunk_type] = _.without(include[chunk_type], chunk)
        if (exclude[chunk_type].indexOf(chunk) < 0) {
            exclude[chunk_type].push(chunk)
        }
        span.removeClass("include");
        span.addClass("exclude");
    }
    else if (span.hasClass("exclude")) {
        // Cycle to normal
        include[chunk_type] = _.without(include[chunk_type], chunk)
        exclude[chunk_type] = _.without(exclude[chunk_type], chunk)
        span.removeClass("exclude");
    }
    else {
        // Cycle to include
        if (include[chunk_type].indexOf(chunk) < 0) {
            include[chunk_type].push(chunk)
        }
        exclude[chunk_type] = _.without(exclude[chunk_type], chunk)
        span.addClass("include");
    }
}

function click_generate_results(event) {
    var amount = Number($("#amount").val());
    var min_inner = Number($("#min-inner").val());
    var min_frequency = Number($("#min-frequency").val());
    // These could be NaN from the Number conversion,
    //  so we're wrapping this in a NOT, because
    //  NaN < 0 returns false.
    if (!(amount >= 1)) {
        // todo: some sort of error message/color
        return;
    }
    if (!(min_inner >= 0)) {
        // todo: some sort of error message/color
        return;
    }
    if (!(min_frequency >= 0)) {
        // todo: some sort of error message/color
        return;
    }
    var new_names = make_names(amount, min_inner, min_frequency);
    update_results_list();
}

function click_clear_results(event) {
    results = [];
    update_results_list();
}

$(document).ready(function() {
    $("#presets")
        .on("change", change_preset)
        .selectpicker()
        .trigger("change");
    $("#add-chunks").on("click", click_add_chunks);
    $("#clear-chunks").on("click", click_clear_chunks);
    $("#chunks-block").on("click", ".chunk", click_chunk);
    $("#generate").on("click", click_generate_results);
    $("#clear-results").on("click", click_clear_results);
});
