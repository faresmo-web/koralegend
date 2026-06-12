var match_code;
var countdown_ht=[];
var match_link=$('#web_site_link').attr('link');
var detail_match = $("#match_list_conf").attr('detail');
var def = $("#match_list_conf").attr('def');
match_code = $('#match_code').val();


$(document).ready(function () {
    if (detail_match) {

        const urlParts = window.location.href.split('/');
        let lastPart = urlParts[urlParts.length - 1];

        lastPart = lastPart.split('?')[0];

        const postText = lastPart.split("-").pop();


        if (postText === "events") {
            $('.events_').click();
            return false;
        }

        if (postText === "statics") {

            $('.statics_').click();
            return false;
        }

        if (postText === "lineup") {

            $('.lineup_tab').click();
            return false;
        }

        if (postText === "live") {

            $('.live_tab').click();
            return false;
        }

        if (def === "1") {
            $('.events_').click();
        }


        var match_id = match_code;
        var loader_is='puff-loader.svg';
        var web_theme = $('html').attr('theme_is');
        if(web_theme==="light"){
            loader_is='puff-loader-light.svg';
        }


        $('.dynamic-content-area-wrap').html('<img class="svg-loader" src="../../../../../images/'+loader_is+'" />');
        $.ajax({
            url: match_link + "get_match_detail",
            type: "get",
            cache: false,
            // dataType: 'json',
            data: {
                home: '',
                away: '',
                home_img: '',
                away_img: '',
                match_id,
                home_link: '',
                away_link: '',
            },
            success: function (response) {


                $('.dynamic-content-area-wrap img').remove();
                $('.dynamic-content-area-wrap').html(response);
                if (typeof window.initMatchHeaderTabsLayout === 'function') {
                    window.initMatchHeaderTabsLayout($('.dynamic-content-area-wrap'));
                }
                var $this = $('.ajax-details-wrapper .live-match');
                var $_id = $this.attr('id');
                const time_info = $('#match_time').val(), ht_time = $('#ht_time').val(), status_info = parseInt($('#match_status').val());
                const timer_info = time_info.toString().split(':');
                const minutes_info = parseInt(timer_info[0], 10);
                const second_info = parseInt(timer_info[1], 10);
                const text_status = $('#result-detail-status-' + match_id).text();
                let formattedsecond_info = second_info.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                });
                let formattedminutes_info = minutes_info.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                });
                var time_loop_a = formattedminutes_info + ':' + formattedsecond_info;
                if (minutes_info >= 90 && status_info === 3) {
                    const min = minutes_info - 90;
                    let formattedmin = min.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                    });
                    $('#result-detail-status-' + match_id).attr('hidden', 'hidden');
                    $('#match-detail-time-' + match_id).html("90:00");
                    $('#minutes-detail-' + match_id).attr("data-minutes", "90");
                    $('#match-detail-' + match_id).removeClass('live-match');
                    $('#match-detail-status-end-' + match_id).html(text_status);
                    $('#ex-detail-' + match_id).html(formattedmin + ':' + formattedsecond_info);
                    $('#extra-detail-time-' + match_id).removeAttr('hidden');
                    clearInterval(interval_c['match-' + match_id]);
                    match_time(time_info, match_id, status_info, 1);

                } else if (minutes_info >= 45 && status_info === 1) {
                    const min = minutes_info - 45;
                    let formattedmin = min.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                    });
                    $('#result-detail-status-' + match_id).attr('hidden', 'hidden');
                    $('#match-detail-time-' + match_id).html("45:00");
                    $('#minutes-detail-' + match_id).attr("data-minutes", "45");
                    $('#match-detail-' + match_id).removeClass('live-match');
                    $('#match-detail-status-end-' + match_id).html(text_status);
                    $('#percent-detail-' + match_id).css('--num', '50');
                    $('#ex-detail-' + match_id).html(formattedmin + ':' + formattedsecond_info);
                    $('#extra-detail-time-' + match_id).removeAttr('hidden');
                    clearInterval(interval_c['match-' + match_id]);
                    match_time(time_info, match_id, status_info, 1);

                } else if (minutes_info >= 105 && status_info === 7) {
                    const min = minutes_info - 105;
                    let formattedmin = min.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                    });
                    $('#result-detail-status-' + match_id).attr('hidden', 'hidden');
                    $('#match-detail-time-' + match_id).html("105:00");
                    $('#minutes-detail-' + match_id).attr("data-minutes", "105");
                    $('#match-detail-' + match_id).removeClass('live-match');
                    $('#match-detail-status-end-' + match_id).html(text_status);
                    $('#percent-detail-' + match_id).css('--num', '90');
                    $('#ex-detail-' + match_id).html(formattedmin + ':' + formattedsecond_info);
                    $('#extra-detail-time-' + match_id).removeAttr('hidden');
                    clearInterval(interval_c['match-' + match_id]);
                    match_time(time_info, match_id, status_info, 1);


                } else if (minutes_info >= 120 && status_info === 9) {
                    const min = minutes_info - 120;
                    let formattedmin = min.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                    });
                    $('#result-detail-status-' + match_id).attr('hidden', 'hidden');
                    $('#match-detail-time-' + match_id).html("120:00");
                    $('#minutes-detail-' + match_id).attr("data-minutes", "120");
                    $('#match-detail-' + match_id).removeClass('live-match');
                    $('#match-detail-status-end-' + match_id).html(text_status);
                    $('#percent-detail-' + match_id).css('--num', '100');
                    $('#ex-detail-' + match_id).html(formattedmin + ':' + formattedsecond_info);
                    $('#extra-detail-time-' + match_id).removeAttr('hidden');
                    clearInterval(interval_c['match-' + match_id]);
                    match_time(time_info, match_id, status_info, 1);
                } else if (status_info === 2 ) {
                    clearInterval(countdown_ht[match_id]);
                    const start_soon=$('#between-time-'+match_id).attr('start_soon');
                    startCountdown(ht_time, match_id,start_soon);
            }else if (status_info === 5 || status_info === 6 || status_info === 8 || status_info === 10 || status_info === 11) {

                } else {
                    $('#match-detail-time-' + match_id).html(time_loop_a);
                    $('#result-detail-status-' + match_id).removeAttr('hidden');
                    match_time(time_info, match_id, status_info, 1);
                }

                doCalculator($this);
                if (!isFinished($this)) {
                    interval_c[$_id] = setInterval(function () {
                        doCalculator($this);
                    }, 60000);
                }
                $('.line-progress').each(function () {
                    $(this).find('.value').attr('style', 'width:' + $(this).find('.value').attr('data-value') + '%');
                });

                $('.prediction-result-wrap').find('.progress-bar').each(function () {
                    $(this).attr('style', 'width:' + $(this).attr('data-width'));
                });
                match_code = $('#match_code').val();
                var match_date_time = $('#match_datetime').val();
                  countDownTimer(match_date_time,match_code);
            },
        });

        $(".champ-tab-link").removeClass('active');
        $(".home").removeClass('active');

        $(".today_matches").addClass('active');

    }
});



function startCountdown(targetTimestamp, elementId, finishMessage = 'start soon') {

    targetTimestamp = parseInt(targetTimestamp);
    var targetTime = targetTimestamp * 1000;

    if (!$('#bt-' + elementId).length) return;

    countdown_ht[elementId] = setInterval(function () {

        var now = Date.now();
        var difference = targetTime - now;

        if (difference <= 0) {
            clearInterval(countdown_ht[elementId]);
            $('#between-time-' + elementId).attr('style','background: #ffc107');
            $('#between-time-' + elementId).text(finishMessage);
            return;
        }

        var minutes = Math.floor(difference / (1000 * 60));
        var seconds = Math.floor((difference % (1000 * 60)) / 1000);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        $('#bt-' + elementId).text(minutes + ':' + seconds);

    }, 1000);
}


$(document).on('click', '.ajax-match-item', function (e) {
    const home = $(this).attr('home_name'), away = $(this).attr('away_name'), home_link = $(this).attr('home_link'),
        away_link = $(this).attr('away_link'), home_img = $(this).attr('home_image'),
        away_img = $(this).attr('away_image'), match_id = $(this).attr('match_id');
    $('.dynamic-content-area-wrap').show();
    $('.champ-tab-item').hide();
    if ($(window).width() > 991) {
        e.preventDefault();
        var loader_is='puff-loader.svg';
        var web_theme = $('html').attr('theme_is');
        if(web_theme==="light"){
            loader_is='puff-loader-light.svg';
        }


        $('.dynamic-content-area-wrap').html('<img class="svg-loader" src="../../../../../images/'+loader_is+'" />');

        if ($(window).scrollTop() > $('.dynamic-content-area-wrap').offset().top) {
            $('html, body').animate({
                scrollTop: $('.dynamic-content-area-wrap').offset().top
            }, 1000);
        }

        $.ajax({
            url: match_link + "get_match_detail",
            type: "get",
            // dataType: 'json',
            cache: false,
            data: {
                home,
                away,
                home_img,
                away_img,
                match_id,
                home_link,
                away_link,
            },
            success: function (response) {

                $('.dynamic-content-area-wrap img').remove();
                $('.dynamic-content-area-wrap').html(response);
                if (typeof window.initMatchHeaderTabsLayout === 'function') {
                    window.initMatchHeaderTabsLayout($('.dynamic-content-area-wrap'));
                }
                var $this = $('.ajax-details-wrapper .live-match');
                var $_id = $this.attr('id');
                const time_info = $('#match_time').val(), ht_time = $('#ht_time').val(), status_info = parseInt($('#match_status').val());
                const timer_info = time_info.toString().split(':');
                const minutes_info = parseInt(timer_info[0], 10);
                const second_info = parseInt(timer_info[1], 10);
                const text_status = $('#result-detail-status-' + match_id).text();
                let formattedsecond_info = second_info.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                });
                let formattedminutes_info = minutes_info.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                });
                var time_loop_a = formattedminutes_info + ':' + formattedsecond_info;
                if (minutes_info >= 90 && status_info === 3) {
                    const min = minutes_info - 90;
                    let formattedmin = min.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                    });
                    $('#result-detail-status-' + match_id).attr('hidden', 'hidden');
                    $('#match-detail-time-' + match_id).html("90:00");
                    $('#minutes-detail-' + match_id).attr("data-minutes", "90");
                    $('#match-detail-' + match_id).removeClass('live-match');
                    $('#match-detail-status-end-' + match_id).html(text_status);
                    $('#ex-detail-' + match_id).html(formattedmin + ':' + formattedsecond_info);
                    $('#extra-detail-time-' + match_id).removeAttr('hidden');
                    clearInterval(interval_c['match-' + match_id]);
                    match_time(time_info, match_id, status_info, 1);

                } else if (minutes_info >= 45 && status_info === 1) {
                    const min = minutes_info - 45;
                    let formattedmin = min.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                    });
                    $('#result-detail-status-' + match_id).attr('hidden', 'hidden');
                    $('#match-detail-time-' + match_id).html("45:00");
                    $('#minutes-detail-' + match_id).attr("data-minutes", "45");
                    $('#match-detail-' + match_id).removeClass('live-match');
                    $('#match-detail-status-end-' + match_id).html(text_status);
                    $('#percent-detail-' + match_id).css('--num', '50');
                    $('#ex-detail-' + match_id).html(formattedmin + ':' + formattedsecond_info);
                    $('#extra-detail-time-' + match_id).removeAttr('hidden');
                    clearInterval(interval_c['match-' + match_id]);
                    match_time(time_info, match_id, status_info, 1);

                } else if (minutes_info >= 105 && status_info === 7) {
                    const min = minutes_info - 105;
                    let formattedmin = min.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                    });
                    $('#result-detail-status-' + match_id).attr('hidden', 'hidden');
                    $('#match-detail-time-' + match_id).html("105:00");
                    $('#minutes-detail-' + match_id).attr("data-minutes", "105");
                    $('#match-detail-' + match_id).removeClass('live-match');
                    $('#match-detail-status-end-' + match_id).html(text_status);
                    $('#percent-detail-' + match_id).css('--num', '90');
                    $('#ex-detail-' + match_id).html(formattedmin + ':' + formattedsecond_info);
                    $('#extra-detail-time-' + match_id).removeAttr('hidden');
                    clearInterval(interval_c['match-' + match_id]);
                    match_time(time_info, match_id, status_info, 1);


                } else if (minutes_info >= 120 && status_info === 9) {
                    const min = minutes_info - 120;
                    let formattedmin = min.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                    });
                    $('#result-detail-status-' + match_id).attr('hidden', 'hidden');
                    $('#match-detail-time-' + match_id).html("120:00");
                    $('#minutes-detail-' + match_id).attr("data-minutes", "120");
                    $('#match-detail-' + match_id).removeClass('live-match');
                    $('#match-detail-status-end-' + match_id).html(text_status);
                    $('#percent-detail-' + match_id).css('--num', '100');
                    $('#ex-detail-' + match_id).html(formattedmin + ':' + formattedsecond_info);
                    $('#extra-detail-time-' + match_id).removeAttr('hidden');
                    clearInterval(interval_c['match-' + match_id]);
                    match_time(time_info, match_id, status_info, 1);
                }else if (status_info === 2 ) {
                    clearInterval(countdown_ht[match_id]);
                    const start_soon=$('#between-time-'+match_id).attr('start_soon');
                    startCountdown(ht_time, match_id,start_soon);
                } else if (status_info === 5 || status_info === 6 || status_info === 8 || status_info === 10 || status_info === 11) {

                } else {
                    $('#match-detail-time-' + match_id).html(time_loop_a);
                    $('#result-detail-status-' + match_id).removeAttr('hidden');
                    match_time(time_info, match_id, status_info, 1);
                }

                doCalculator($this);
                if (!isFinished($this)) {
                    interval_c[$_id] = setInterval(function () {
                        doCalculator($this);
                    }, 60000);
                }
                $('.line-progress').each(function () {
                    $(this).find('.value').attr('style', 'width:' + $(this).find('.value').attr('data-value') + '%');
                });

                $('.prediction-result-wrap').find('.progress-bar').each(function () {
                    $(this).attr('style', 'width:' + $(this).attr('data-width'));
                });
                match_code = $('#match_code').val();
                var match_date_time = $('#match_datetime').val();
                 countDownTimer(match_date_time,match_code);
                $('[data-toggle="tooltip"]').tooltip();

            },
        });

        // const link_match=$(this).attr('href');
        // const relativeUrl = new URL(link_match).pathname;
        //  history.pushState(null, '', relativeUrl);
        // $(".champ-tab-link").removeClass('active');

     }
});

$(document).on('click', '.detail_', function (e) {
    if (detail_match) {
        e.preventDefault();

        let title_ = $(this).attr('title');
        let link_ = $(this).attr('link');
        document.title = title_;
        window.history.pushState({}, "", link_);
    }
    $('#rank_pos').hide();  $('#stages_target').hide();
});

$(document).on('click', '.events_', function (e) {
    if (detail_match) {
        e.preventDefault();
        let title_ = $(this).attr('title');
        let link_ = $(this).attr('link');
        document.title = title_;
        window.history.pushState({}, "", link_);
    }
    $('#rank_pos').hide();  $('#stages_target').hide();
    $('.line-progress').each(function () {
        $(this).find('.value').attr('style', 'width:' + $(this).find('.value').attr('data-value') + '%');
    });

    $('.prediction-result-wrap').find('.progress-bar').each(function () {
        $(this).attr('style', 'width:' + $(this).attr('data-width'));
    });
});

$(document).on('click', '.statics_', function (e) {
    if (detail_match) {
        e.preventDefault();

        let title_ = $(this).attr('title');
        let link_ = $(this).attr('link');
        document.title = title_;
        window.history.pushState({}, "", link_);
    }
    $('#rank_pos').hide();  $('#stages_target').hide();
});

$(document).on('click', '.news_tab', function (e) {
    e.preventDefault();

    var loader_is = 'puff-loader.svg';
    var web_theme = $('html').attr('theme_is');
    if (web_theme === "light") {
        loader_is = 'puff-loader-light.svg';
    }
    $('#rank_pos').hide();  $('#stages_target').hide();
     $('#news_list').html('<img class="svg-loader" src="./../images/' + loader_is + '" />');

    $.ajax({
        url: match_link + "get_match_news",
        type: "get",
        data: {
            match_code: match_code
        },
        success: function (response) {
             var items = [];
            if (response && Array.isArray(response.items)) {
                items = response.items;
            } else if (response && response.items && typeof response.items === 'object') {
                 items = Object.values(response.items);
            }

             $('#news_list_more').hide().removeAttr('page');

            if (items.length > 0) {
                 $('#news_list').html('<div id="news_more" class="mini-news-items"></div>');

                 items.forEach(function (value) {
                    // protect against missing fields
                    var link = value.link || '#';
                    var image = value.image || '';
                    var title = value.title || '';
                    var desc = value.news_desc || '';

                    var itemHtml = ''
                        + '<a href="' + link + '" class="news-item">'
                        + '  <div class="news-img">'
                        + '    <img src="' + image + '" alt="' + escapeHtml(title) + '">'
                        + '  </div>'
                        + '  <div class="mini-news-content">'
                        + '    <h3 class="news-title">' + escapeHtml(title) + '</h3>'
                        + '    <div class="news-date"><span>' + escapeHtml(desc) + '</span></div>'
                        + '  </div>'
                        + '</a>';

                    $('#news_more').append(itemHtml);
                });

                 if (response && response.page) {
                    $('#news_list_more').show().attr('page', response.page);
                }
            } else {
                 var no_result = $('meta[name="_token"]').attr('no_result') || 'No results';
                $('#news_list_more').hide();
                $('#news_list').html(
                    '<div class="search-no-results-wrap">'
                    + '  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">'
                    + '    <path d="M73.171,78.828,58.459,64.116a36.036,36.036,0,1,1,5.657-5.657L78.828,73.171a4,4,0,1,1-5.657,5.657ZM8,36A27.987,27.987,0,0,0,55.48,56.1a4.032,4.032,0,0,1,.617-.617A28,28,0,1,0,8,36ZM41.657,47.313,36,41.657l-5.657,5.657a4,4,0,1,1-5.657-5.657L30.343,36l-5.657-5.657a4,4,0,1,1,5.657-5.657L36,30.343l5.657-5.657a4,4,0,1,1,5.657,5.657L41.657,36l5.657,5.657a4,4,0,1,1-5.657,5.657Z" fill="#5f6276"></path>'
                    + '  </svg>'
                    + '  <h3>' + escapeHtml(no_result) + '</h3>'
                    + '</div>'
                );
            }
        },
        error: function (xhr, status, error) {
             $('#news_list_more').hide();
            $('#news_list').html('<div class="search-no-results-wrap"><h3>Failed to load news</h3></div>');
            console.error('get_match_news error:', status, error);
        }
    });


});


// small helper to escape HTML to avoid injection issues
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

$(document).on('click', '#news_list_more', function (e) {
    e.preventDefault();

     var $btn = $(this);
    var page = $btn.attr('data-page') || $btn.attr('page') || null;

    var loader_is = 'puff-loader.svg';
    var web_theme = $('html').attr('theme_is');
    if (web_theme === "light") {
        loader_is = 'puff-loader-light.svg';
    }

    $('#loader_news').html('<img class="svg-loader" src="../../images/' + loader_is + '" />');

    $.ajax({
        url: match_link + "get_match_news_more",
        type: "get",
        dataType: "json",
        data: {
            match_code: match_code,
            page: page
        },
        success: function (response) {
             $('#loader_news').empty();

             var items = [];
            if (response && Array.isArray(response.items)) {
                items = response.items;
            } else if (response && response.items && typeof response.items === 'object') {
                items = Object.values(response.items);
            }

             if (items.length > 0) {
                items.forEach(function (value) {
                    var link = value.link || '#';
                    var image = value.image || '';
                    var title = value.title || '';
                    var desc = value.news_desc || '';

                    var itemHtml = ''
                        + '<a href="' + link + '" class="news-item">'
                        + '  <div class="news-img"><img src="' + image + '" alt="' + escapeHtml(title) + '"></div>'
                        + '  <div class="mini-news-content">'
                        + '    <h3 class="news-title">' + escapeHtml(title) + '</h3>'
                        + '    <div class="news-date"><span>' + escapeHtml(desc) + '</span></div>'
                        + '  </div>'
                        + '</a>';

                    $('#news_more').append(itemHtml);
                });
            }

             if (response && (response.page === null || typeof response.page === 'undefined')) {
                $btn.remove();
            } else {
                 $btn.show().attr('data-page', response.page).attr('page', response.page);
            }
        },
        error: function (xhr, status, err) {
            $('#loader_news').empty();
            console.error('get_match_news_more error:', status, err);
         }
    });

});


$(document).on('click', '.live_tab', function (e) {

    if (detail_match) {
        e.preventDefault();

        let title_ = $(this).attr('title');
        let link_ = $(this).attr('link');
        document.title = title_;
        window.history.pushState({}, "", link_);
    }
    $('#rank_pos').hide();  $('#stages_target').hide();
    $.ajax({
        url: match_link + "get_match_live",
        type: "get",
        data: {
            match_code,
        },
        success: function (response) {
            $("#live_match").html(response);
        },
    });
});

$(document).on('click', '.visitors_area_tab', function (e) {
    $('#rank_pos').hide();  $('#stages_target').hide();

    $.ajax({
        url: match_link + "get_comments_list",
        type: "get",
        data: {
            match_code,
        },
        success: function (response) {
             if (response) {
                $('#user_comment').empty();
                $('#more_comments').show();
                 $('#is_more').remove();
                $('#comments_users').html(response);
                 let is_more=$('#is_more').attr('more');
                 if(is_more==='0'){
                    $('#more_comments').hide();
                }

            } else {
                $('#more_comments').hide();
            }
        },
    });

});

$(document).on('click', '.predict_area_tab', function (e) {

    e.preventDefault();

    var loader_is = 'puff-loader.svg';
    var web_theme = $('html').attr('theme_is');

    if (web_theme === "light") {
        loader_is = 'puff-loader-light.svg';
    }

    $('#rank_pos').hide();
    $('#stages_target').hide();

    $('#predict_area').html(
        '<img class="svg-loader" src="./../images/' + loader_is + '" />'
    );

    $.ajax({
        url: match_link + "predict_area_result",
        type: "GET",
        data: {
            match_code: match_code
        },

        success: function (response) {

            $('.predict_area').show();

            let html = '';

            let sorted = response.sort(function (a, b) {
                return (b.user_is === true) - (a.user_is === true);
            });

            let rank = 1;

            sorted.forEach(function (item) {

                let resultText = item.result;


                if (
                    item.predicted_tied == 0 &&
                    item.home_score == item.away_score
                ) {
                    resultText = ``;
                }


                if (item.user_is === true) {

                    html += `
            <div class="interactive-rank">
                <div class="interactive-item active">
                    <img src="${item.user_image}">
                    <div class="text">
                        <span>${item.user_name}</span>
                        <span class="num points_details">
                            ${item.result}
                        </span>
                    </div>
                </div>
            </div>
        `;

                } else {

                    html += `
            <div class="interactive-rank">
                <div class="interactive-item">
                    <div class="rank-num">${rank}</div>
                    <img src="${item.user_image}">
                    <div class="text">
                        <span>${item.user_name}</span>
                        <span class="num points_details">
                            ${resultText}
                        </span>
                    </div>
                </div>
            </div>
        `;

                    rank++; // only increase for non-user rows
                }
            });

            $('#predict_area').html(html);
        },

        error: function () {
            $('#predict_area').html('');
        }
    });

});


$(document).on('click', '#no_pre', function (e) {
    $.ajax({
        url: "user_pre_no",
        type: "GET",
        data: {
         },
        success: function (response) {
            if (response.status===1) {
                $('.warning-hint').remove();
            }

        }
    });
});

$(document).on('click', '#more_comments', function (e) {
    var comments = $("#comments_users .comment-item"), count_comments = comments.length,
        news_id = $('#comment_match').attr('news');

    var loader_is='puff-loader.svg';
    var web_theme = $('html').attr('theme_is');
    if(web_theme==="light"){
        loader_is='puff-loader-light.svg';
    }


    $('#loader_comment').html('<img  src="../../../../../images/'+loader_is+'" />');

    $.ajax({
        url: match_link + "get_comments_list_more",
        type: "get",
        data: {
            count_comments,
            match_code,
            news_id,
        },
        success: function (response) {
            $('#is_more').remove();
            $('#loader_comment img').remove();
            $('#comments_users').append(response);

            if (!response) {
                $('#more_comments').remove();
            }
            let is_more=$('#is_more').attr('more');
            if(is_more==='0'){
                $('#more_comments').hide();
            }
        },
    });
});
$(document).on('click', '.like,.dislike', function (e) {
    var audio_sound, this_ = $(this), news_id = $('#comment_match').attr('news');
    const type = $(this).attr('type_c'), comm_id = $(this).attr('comment'), click_ = $(this).attr('click'),
        div_ = $('#' + type + comm_id), dislike_ = $('#d' + comm_id), like_ = $('#l' + comm_id),
        like_div = $('#like' + comm_id), dislike_div = $('#dislike' + comm_id),
        count_div = parseInt(div_.text()) + 1, min_like = parseInt(like_div.text()) - 1,
        min_dislike = parseInt(dislike_div.text()) - 1;

    if (type === "like") {
        audio_sound = new Audio("/sound/like.mp3");
    } else if (type === "dislike") {
        audio_sound = new Audio("/sound/dislike.mp3");
    }

    $.ajax({
        headers: {
            'X-CSRF-Token': $('meta[name="_token"]').attr('content'),
        },
        url: match_link + "like_comment",
        type: "post",
        data: {
            type,
            comm_id,
        },
        success: function (response) {
            if (response.status === true) {
                audio_sound.play();
                this_.contents('svg').contents('path').attr('fill', '#39DBBF');
                this_.removeClass(type);
                this_.addClass("clicked");
                dislike_.attr('click', '1');
                like_.attr('click', '1');
                dislike_div.text(response.dislike_is);
                like_div.text(response.like_is);
                if (click_) {
                    if (type === "like") {
                        dislike_.contents('svg').contents('path').attr('fill', '#707488');
                        dislike_.addClass("dislike");
                        dislike_.removeClass("clicked");
                    } else if (type === "dislike") {
                        like_.contents('svg').contents('path').attr('fill', '#707488');
                        like_.addClass("like");
                        like_.removeClass("clicked");

                    }

                }
            }


        },
    });


});

$(document).on('click', '.clicked', function (e) {
    const this_ = $(this), type = $(this).attr('type_c'), comm_id = $(this).attr('comment'),
        dislike_ = $('#d' + comm_id), like_ = $('#l' + comm_id),
        like_div = $('#like' + comm_id), dislike_div = $('#dislike' + comm_id),
        div_ = $('#' + type + comm_id), count_div = parseInt(div_.text()) - 1;

    var sound = new Audio("/sound/stop.mp3");
    $.ajax({
        headers: {
            'X-CSRF-Token': $('meta[name="_token"]').attr('content'),
        },
        url: match_link + "remove_like",
        type: "post",
        data: {
            type,
            comm_id,
        },
        success: function (response) {
            if (response.status === true) {
                this_.contents('svg').contents('path').attr('fill', '#707488');
                this_.removeClass("clicked");
                this_.addClass(type);
                like_.removeAttr("click");
                dislike_.removeAttr("click");
                dislike_div.text(response.dislike_is);
                like_div.text(response.like_is);
                sound.play();
            }
        },
    });

});

$(document).on('click', '.round_detail', function (e) {
    const team_a_r = $(this).attr('teamA'), team_b_r = $(this).attr('teamB'),
        team_a_r_name = $(this).attr('teamA_name'), team_b_r_name = $(this).attr('teamB_name')
        , round_r = $(this).attr('round'), league_id_r = $(this).attr('league_id'),
        team_a_image = $(this).attr('teamA_image'), team_b_image = $(this).attr('teamB_image'),
        div_id_r = $(this).attr('div_id'),
        end_match = $('#round_div').attr('end_match'), on_match = $('#round_div').attr('on_match');

    if ($(this).hasClass('active')) {
        $('#teams_round_matches' + div_id_r).html('<div class="inline-loader"><img  src="../../../../../images/three-dots.svg" /></div>');
        $.ajax({
            url: match_link + "get_matches_a_b",
            type: "get",
            data: {
                team_a_r,
                team_b_r,
                round_r,
                league_id_r,
            },
            success: function (response) {
                $('#teams_round_matches' + div_id_r).empty();
                var home_team_r, away_team_r, home_team_r_name, away_team_r_name, home_team_r_image, away_team_r_image,
                    match_st_warp;

                if (response.length !== 0) {
                    $.each(response, function (index, value) {
                        if (value['type'] === 1 || value['type'] === 0) {
                            home_team_r_name = team_a_r_name;
                            away_team_r_name = team_b_r_name;
                            home_team_r = team_a_r;
                            away_team_r = team_b_r;
                            home_team_r_image = team_a_image;
                            away_team_r_image = team_b_image;
                        } else if (value['type'] === 2) {
                            home_team_r_name = team_b_r_name;
                            away_team_r_name = team_a_r_name;
                            home_team_r = team_b_r;
                            away_team_r = team_a_r;
                            home_team_r_image = team_b_image;
                            away_team_r_image = team_a_image;

                        }

                        if (value['status'] === 0) {
                            match_st_warp = '</div>\n' +
                                '                                    <div class="result-wrap">\n' +
                                '                                        <span class="result-status-text">' + value['date'] + '</span>\n' +
                                '                                        <b class="match-date">\n' +
                                '                                        ' + value['time'] + '</b>\n' +
                                '                                    </div>';

                        } else if (value['status'] === 4) {
                            match_st_warp = '</div>\n' +
                                '                                    <div class="result-wrap">\n' +
                                '                                        <span class="result-status-text">' + end_match + '</span>\n' +
                                '                                        <b class="match-date">\n' +
                                '                                            <span class="first-team-result ">' + value['home_scores'] + '</span>\n' +
                                '                                            <i>-</i>\n' +
                                '                                            <span class="second-team-result ">' + value['away_scores'] + '</span>\n' +
                                '                                        </b>\n' +
                                '                                    </div>';

                        } else {
                            match_st_warp = '</div>\n' +
                                '                                    <div class="result-wrap">\n' +
                                '                                        <span class="result-status-text"></span>\n' +
                                '                                        <b class="match-date">\n' +
                                '' + on_match + '</b>' +
                                '                                    </div>';
                        }

                        $('#teams_round_matches' + div_id_r).append('<a href="' + value['link'] + '" class="inline-match-item match-with-result">\n' +
                            '                                    <div class="first-team">\n' +
                            '                                        <div class="team---item">\n' +
                            '                                            <b>' + home_team_r_name + '</b>\n' +
                            '                                            <div class="img"><img src="' + home_team_r_image + '"></div>\n' +
                            '                                        </div>\n' + match_st_warp +
                            '                                    <div class="second-team">\n' +
                            '                                        <div class="team---item">\n' +
                            '                                            <div class="img"><img src="' + away_team_r_image + '"></div>\n' +
                            '                                            <b>' + away_team_r_name + '</b>\n' +
                            '                                        </div>\n' +
                            '                                    </div>\n' +
                            '                                </a>');
                    });

                } else {

                    $('#teams_round_matches' + div_id_r).append('<div class="no-matches-wrapper">\n' +
                        '                        <svg style="\n' +
                        '    margin-bottom: 0px;\n' +
                        '" xmlns="http://www.w3.org/2000/svg" width="50.743" height="50.243" viewBox="0 0 50.743 50.243">\n' +
                        '                            <path id="Path_35" data-name="Path 35" d="M-119.131,20h-41.249a1.376,1.376,0,0,0-1.375,1.375h0V51.625A1.376,1.376,0,0,0-160.381,53h41.249a1.376,1.376,0,0,0,1.375-1.375h0V21.375A1.376,1.376,0,0,0-119.131,20Zm-19.249,11.2a5.473,5.473,0,0,1,3.959,6.651,5.473,5.473,0,0,1-3.959,3.959Zm-20.625,0a5.473,5.473,0,0,1,3.959,6.651,5.473,5.473,0,0,1-3.959,3.959Zm17.875,10.61a5.473,5.473,0,0,1-3.959-6.651A5.473,5.473,0,0,1-141.13,31.2Zm0-13.431a8.241,8.241,0,0,0-6.759,9.494,8.24,8.24,0,0,0,6.759,6.759v5.623h-17.877V44.626a8.241,8.241,0,0,0,6.759-9.494,8.242,8.242,0,0,0-6.759-6.759V22.751h17.875Zm20.625,13.431a5.473,5.473,0,0,1-3.959-6.651,5.472,5.472,0,0,1,3.959-3.959Zm0-13.431a8.241,8.241,0,0,0-6.759,9.494,8.24,8.24,0,0,0,6.759,6.759v5.623h-17.875V44.626a8.241,8.241,0,0,0,6.759-9.494,8.242,8.242,0,0,0-6.759-6.759V22.751h17.874Z" transform="translate(163.877 -10.379)" fill="#4c5064"></path>\n' +
                        '                            <line id="Line_83" data-name="Line 83" x2="44.5" y2="44" transform="translate(2.121 4.121)" fill="none" stroke="#4c5064" stroke-linecap="round" stroke-width="3"></line>\n' +
                        '                            <line id="Line_84" data-name="Line 84" x2="44.5" y2="44" transform="translate(4.121 2.121)" fill="none" stroke="#151825" stroke-linecap="round" stroke-width="3"></line>\n' +
                        '                        </svg>\n' +
                        '                    </div>');
                }
            }
        });
    }
});

$(document).on('click', '.get_round_info', function (e) {
    const team_a_r = $(this).attr('teama'), team_b_r = $(this).attr('teamb'),
        team_a_r_name = $(this).attr('teama_name'), team_b_r_name = $(this).attr('teamb_name')
        , round_r = $(this).attr('round'), league_id_r = $(this).attr('league_id'), win_team = $(this).attr('winteam'),
        team_a_image = $(this).attr('teama_image'), team_b_image = $(this).attr('teamb_image'),
        end_match = $('#round_div').attr('end_match'), on_match = $('#round_div').attr('on_match');
    var win_name = '';
    $('#teams_pop_match').html('' + team_a_r_name + ' vs ' + team_b_r_name + '');
    if (win_team !== "null") {
        if (team_a_r === win_team) {
            win_name = team_a_r_name;
        } else if (team_b_r === win_team) {
            win_name = team_b_r_name;
        }
         if(round_r==8){
            $('#teams_pop_win_team').html('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="18" viewBox="0 0 14.089 25.724">\n' +
                '  <g id="Layer_6" data-name="Layer 6" transform="translate(-7.86 -1.147)">\n' +
                '    <path id="Path_53644" data-name="Path 53644" d="M9.474,10.47h0v.043a13.432,13.432,0,0,0,3.669,4.7,10.386,10.386,0,0,0,.865.64h0c.294.2.6.4.865.58a7.523,7.523,0,0,0,.865-.58h0a10.385,10.385,0,0,0,.865-.64,13.259,13.259,0,0,0,3.15-3.7c.19-.329.363-.675.528-1.021h0v0l.052-.113v-.069a13.414,13.414,0,0,0,.658-1.8h0V8.437c.1-.363.182-.727.251-1.1h0a13.475,13.475,0,0,0,.234-2.467l-5.66-3.5a1.662,1.662,0,0,0-1.679,0L8.21,4.784A13.449,13.449,0,0,0,9.474,10.47Z" transform="translate(-0.047)" fill="#e6a900"></path>\n' +
                '    <path id="Path_53645" data-name="Path 53645" d="M15.121,19.117l-.216.13-.216-.13a14.1,14.1,0,0,1-1.566-1.047v2.891h3.566V18.07a14.1,14.1,0,0,1-1.566,1.047Zm5.513,6.491H9.175A1.315,1.315,0,0,0,7.86,26.915v1.731a.5.5,0,0,0,.511.5H21.439a.5.5,0,0,0,.511-.5V26.915a1.315,1.315,0,0,0-1.315-1.307ZM11.365,23.2a1.307,1.307,0,0,0-1.307,1.315v.614a.242.242,0,0,0,0,.078h9.684a.242.242,0,0,0,0-.078v-.614a1.307,1.307,0,0,0-1.3-1.315Zm.286-.692v.147a.242.242,0,0,0,0,.078h6.491a.242.242,0,0,0,0-.078V22.51A1.307,1.307,0,0,0,16.835,21.2H12.94a1.307,1.307,0,0,0-1.29,1.307Z" transform="translate(0 -2.277)" fill="#e6a900"></path>\n' +
                '  </g>\n' +
                '</svg><span>' + win_name + '</span>');
        }else{
        $('#teams_pop_win_team').html('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 10 10">\n' +
            '<path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path>\n' +
            '</svg><span>' + win_name + '</span>');
        }
    } else {
        $('#teams_pop_win_team').html('');
    }

    $('#goal_a').empty();
    $('#goal_b').empty();

    $.ajax({
        url: match_link + "get_matches_a_b",
        type: "get",
        data: {
            team_a_r,
            team_b_r,
            round_r,
            league_id_r,
        },
        success: function (response) {
            $('#teams_round_matches_pop').empty();
            var home_team_r, away_team_r, home_team_r_name, away_team_r_name, home_team_r_image, away_team_r_image,
                match_st_warp;

            if (response.length !== 0) {
                var matchesHtml = '';
                var match_goals = '';

                $.each(response, function (index, value) {

                    if (value['type'] === 1 || value['type'] === 0) {
                        home_team_r_name = team_a_r_name;
                        away_team_r_name = team_b_r_name;
                        home_team_r = team_a_r;
                        away_team_r = team_b_r;
                        home_team_r_image = team_a_image;
                        away_team_r_image = team_b_image;
                    } else if (value['type'] === 2) {
                        home_team_r_name = team_b_r_name;
                        away_team_r_name = team_a_r_name;
                        home_team_r = team_b_r;
                        away_team_r = team_a_r;
                        home_team_r_image = team_b_image;
                        away_team_r_image = team_a_image;
                    }



                    if (value['status'] === 0) {
                        match_st_warp = `
            </div>
            <div class="result-wrap">
                <span class="result-status-text">${value['date']}</span>
                <b class="match-date">${value['time']}</b>
            </div>`;
                    } else if (value['status'] === 4) {
                        match_st_warp = `
            </div>
            <div class="result-wrap">
                <span class="result-status-text">${end_match}</span>
                <b class="match-date">
                    <span class="first-team-result">${value['home_scores']}</span>
                    <i>-</i>
                    <span class="second-team-result">${value['away_scores']}</span>
                </b>
            </div>`;
                    } else {
                        match_st_warp = `
            </div>
            <div class="result-wrap">
                <span class="result-status-text"></span>
                <b class="match-date">${on_match}</b>
            </div>`;
                    }

                    matchesHtml += `
        <a href="${value['link']}" class="inline-match-item match-with-result">
            <div class="first-team">
                <div class="team---item">
                    <b>${home_team_r_name}</b>
                    <div class="img"><img src="${home_team_r_image}"></div>
                </div>
                ${match_st_warp}
            </div>
                     <div class="second-team">
                <div class="team---item">
                    <div class="img"><img src="${away_team_r_image}"></div>
                    <b>${away_team_r_name}</b>
                </div>
            </div>
          </a>
          <div class="match-event-item penalties custom-events" style="color: #bfc3d4">
                            <div class="team-item team-a">
                                <ol id="goal_a_${value['match_id']}" class="shots-text">
                                </ol>
                            </div>
                            <div style="width: 50px; padding-top: 2px; margin: 2px 10px 0;">
                            </div>
                            <div class="team-item team-b">
                                <ol id="goal_b_${value['match_id']}" class="shots-text">
                                </ol>
                            </div>
                        </div>`;

                });

                $('#teams_round_matches_pop').append(matchesHtml);


                $.each(response, function (index, value) {

                if (value['goals'].length !== 0) {

                        var team_a_value = value['home_team'];
                        var team_b_value = value['away_team'];

                    var team_g_type;
                    if (value['goals'][value['match_id']].length !== 0) {
                         $.each(value['goals'][value['match_id']], function (key, value_) {
                            team_g_type = (key == team_a_value) ? '#goal_a_' + value['match_id'] : (key == team_b_value) ? '#goal_b_' + value['match_id'] : null;
                            $(team_g_type).empty();
                            if (team_g_type) {
                                $.each(value_, function (key_, value_1) {
                                    var og='';
                                    if(value_1['type']===4){
                                        og=' OG';
                                    }
                                     $(team_g_type).append('<a style="margin: 4px 0;\n' +
                                         '    display: block;">' + value_1['min'] + '’  ' + value_1['name'] + '<i style="color: red">' + og + '</i></a>');
                                });
                            }
                        });
                    }
                }
                });

            } else {

                $('#teams_round_matches_pop').append('<div class="no-matches-wrapper">\n' +
                    '                        <svg style="\n' +
                    '    margin-bottom: 0px;\n' +
                    '" xmlns="http://www.w3.org/2000/svg" width="50.743" height="50.243" viewBox="0 0 50.743 50.243">\n' +
                    '                            <path id="Path_35" data-name="Path 35" d="M-119.131,20h-41.249a1.376,1.376,0,0,0-1.375,1.375h0V51.625A1.376,1.376,0,0,0-160.381,53h41.249a1.376,1.376,0,0,0,1.375-1.375h0V21.375A1.376,1.376,0,0,0-119.131,20Zm-19.249,11.2a5.473,5.473,0,0,1,3.959,6.651,5.473,5.473,0,0,1-3.959,3.959Zm-20.625,0a5.473,5.473,0,0,1,3.959,6.651,5.473,5.473,0,0,1-3.959,3.959Zm17.875,10.61a5.473,5.473,0,0,1-3.959-6.651A5.473,5.473,0,0,1-141.13,31.2Zm0-13.431a8.241,8.241,0,0,0-6.759,9.494,8.24,8.24,0,0,0,6.759,6.759v5.623h-17.877V44.626a8.241,8.241,0,0,0,6.759-9.494,8.242,8.242,0,0,0-6.759-6.759V22.751h17.875Zm20.625,13.431a5.473,5.473,0,0,1-3.959-6.651,5.472,5.472,0,0,1,3.959-3.959Zm0-13.431a8.241,8.241,0,0,0-6.759,9.494,8.24,8.24,0,0,0,6.759,6.759v5.623h-17.875V44.626a8.241,8.241,0,0,0,6.759-9.494,8.242,8.242,0,0,0-6.759-6.759V22.751h17.874Z" transform="translate(163.877 -10.379)" fill="#4c5064"></path>\n' +
                    '                            <line id="Line_83" data-name="Line 83" x2="44.5" y2="44" transform="translate(2.121 4.121)" fill="none" stroke="#4c5064" stroke-linecap="round" stroke-width="3"></line>\n' +
                    '                            <line id="Line_84" data-name="Line 84" x2="44.5" y2="44" transform="translate(4.121 2.121)" fill="none" stroke="#151825" stroke-linecap="round" stroke-width="3"></line>\n' +
                    '                        </svg>\n' +
                    '                    </div>');
            }

        }
    });
});

$(document).on('click', '.rank_tab', function (e) {

    var  _porm = $('#rank_key'), g_porm = $('#rank_key_g'),
        main_table_g = $('#main_table_g'),main_table_g_h = $('#main_table_g_h'),main_table_g_a = $('#main_table_g_a'), meta_content = $('meta[name="_token"]'),
        detail_ = meta_content.attr('detail');

    $('#main_table').empty();
    $('#main_table_h').empty();
    $('#main_table_a').empty();
    $('#key_main').empty();
    $('#rules_main').empty();
    $('#stages_target').empty();
    $('#rules_main_g').empty();
    $('#key_main_g').empty();
    $('#main_table_g').empty();
    $('#main_table_g_h').empty();
    $('#main_table_g_a').empty();

    $('#stages_target').show();

    g_porm.empty();

    $.ajax({
        url: match_link + "get_league_rank",
        type: "get",
        data: {
            match_code,
        },
        success: function (response) {
            var match_list = response.list_match, match_list_h = response.list_match_h,match_list_a = response.list_match_a,prom_ = response.promotion, playoff = response.playoff,
                type_champ = response.type_league, cups_rounds = response.cups_rounds;
            var round_a_id, round_b_id, round_8_id, col;
            var home_team = response.Home_team, away_team = response.Away_team;
            var round_index;
            var gg_team_id=home_team+away_team;
            var match_type_is=response.match_type;

            if (type_champ === 1) {
                $('#league').show();
                $('#group_cup').hide();
            } else {
                $('#group_cup').show();
                $('#league').hide();
            }


            var active_bar=response.active_bar;
            const totalStages = match_list.length;
            const matchKeys = Object.keys(match_list);
            let defaultActiveIndex = matchKeys.length > 0 ? parseInt(matchKeys[0]) : 0;

            if (response.stages && Array.isArray(response.stages)) {
                const activeIndex = response.stages.findIndex(stage => stage.tab === 1);
                defaultActiveIndex = activeIndex !== -1 ? activeIndex : defaultActiveIndex;
            }

            if (prom_ && Object.keys(prom_).length > 0) {
                const $keyMain = $('#key_main');
                const $keyMainG = $('#key_main_g');
                const keyTitle = $keyMain.attr('keytitle');
                const upRank = $keyMain.attr('up_rank');
                const downRank = $keyMain.attr('down_rank');

                let index = 0;
                for (const [stageKey, pormRank] of Object.entries(prom_)) {
                    const keyRankId = `rank_key${stageKey}`;
                    const rank_keysId = `rank-keys${stageKey}`;
                    const upKeyInfo = `up_key_info${stageKey}`;
                    const isActive = stageKey == defaultActiveIndex;

                    // Block for ranking arrows (existing block)
                    const rankBlock = `
            <div id="${rank_keysId}" class="rank-keys" style="display: ${isActive ? 'block' : 'none'};">
                <div class="block-title">${keyTitle}</div>
                <div class="rank-keys-items">
                    <div id="${keyRankId}" class="rank-keys-items rank-keys-promo-row" style="display: ${isActive ? 'flex' : 'none'};"></div>
                    <div class="rank-key ${upKeyInfo}" style="display:none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5">
                            <path d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" fill="#39dbbf"></path>
                        </svg>
                        <span>${upRank}</span>
                    </div>
                    <div class="rank-key ${upKeyInfo}" style="display:none">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5">
                            <path d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" transform="translate(12 5) rotate(180)" fill="#fc4d4d"></path>
                        </svg>
                        <span>${downRank}</span>
                    </div>
                </div>
            </div>`;



                     if (type_champ === 1) {
                        $keyMain.append(rankBlock);
                        $(`#${keyRankId}`).prepend(pormRank);
                    } else {
                        $keyMainG.append(rankBlock);
                        $(`#${keyRankId}`).prepend(pormRank);
                    }

                    index++;
                }
            }
            if (response.rules_league && Object.keys(response.rules_league).length > 0) {
                const $ruleMain = $('#rules_main');
                const $ruleMainG = $('#rules_main_g');
                const ruleName = $ruleMain.attr('keytitle');
                const editIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="19.8" height="20.8" viewBox="0 0 19.8 20.8">
            <g id="file-text-edit" transform="translate(-3342.1 -293.1)">
                <path id="file-text-edit-2" d="M3361.27,305.72l-.991-.99a1.623,1.623,0,0,0-1.158-.48h0a1.624,1.624,0,0,0-1.159.483l-5.491,5.516a.745.745,0,0,0-.219.529V313a.75.75,0,0,0,.75.75h2.223a.751.751,0,0,0,.529-.219l5.516-5.49a1.641,1.641,0,0,0,0-2.321Zm-2.149.03a.134.134,0,0,1,.1.041l.99.99a.138.138,0,0,1,.041.1.136.136,0,0,1-.041.1l-.636.633-1.184-1.184.633-.636A.139.139,0,0,1,3359.121,305.75Zm-4.208,6.5h-1.163v-1.163l3.581-3.6,1.179,1.179Zm-4.913-1h-4c-1.577,0-2.25-.673-2.25-2.25V297c0-1.577.673-2.25,2.25-2.25h5.25V297a3.383,3.383,0,0,0,3.75,3.75h2.25V302a.75.75,0,0,0,1.5,0v-2a.747.747,0,0,0-.22-.53l-6-6a.747.747,0,0,0-.53-.22h-6a3.383,3.383,0,0,0-3.75,3.75v12a3.383,3.383,0,0,0,3.75,3.75h4a.75.75,0,0,0,0-1.5Zm2.75-14.25v-1.189l3.439,3.439H3355C3353.423,299.25,3352.75,298.577,3352.75,297Zm-5.75,5.25a.75.75,0,0,0,0,1.5h7a.75.75,0,0,0,0-1.5Zm4,4h-4a.75.75,0,0,0,0,1.5h4a.75.75,0,0,0,0-1.5Z" fill="#39dbbf" stroke="#39dbbf" stroke-width="0.3"></path>
            </g>
        </svg>`;

                const arrowSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="6" height="11" viewBox="0 0 6 11">
            <path id="Shape" d="M4.189,5.5.22,9.659a.812.812,0,0,0,0,1.111.726.726,0,0,0,1.061,0l4.5-4.714a.812.812,0,0,0,0-1.111L1.28.23A.726.726,0,0,0,.22.23a.812.812,0,0,0,0,1.111Z" fill="#707488"/>
        </svg>`;

                for (const [stageKey, rules] of Object.entries(response.rules_league)) {
                    const ruleKeyId = `rule_key${stageKey}`;
                    const rulesListId = `rules_list${stageKey}`;
                    const isActive = stageKey == defaultActiveIndex;

                    const hasRules = Object.keys(rules).length > 0;

                    const ruleBlock = `
  <div id="${ruleKeyId}" class="rule_key" style="display: ${hasRules ? (isActive ? 'block' : 'none') : 'none'};">
                <div class="collapse-item-wrap match-info-collapse">
                    <div class="collapse-header">
                        <div class="title match-rules">${editIconSvg} ${ruleName}</div>
                        ${arrowSvg}
                    </div>
                    <div id="${rulesListId}" class="collapse-content" style="display: none"></div>
                </div>
            </div>`;


                    if (type_champ === 1) {
                        $ruleMain.append(ruleBlock);
                    } else {
                        $ruleMainG.append(ruleBlock);
                    }
                    if (hasRules) {
                    const ruleHtml = Object.entries(rules).map(
                        ([idx, title]) => `
                <div class="match-info-item sub">
                    <div class="title">${idx}-${title}</div>
                </div>`
                    ).join('');

                    $(`#${rulesListId}`).html(ruleHtml);
                }
                }
            }



            $.each(match_list, function(stageIndex, teamsByRank) {
                const stage = response.stages && response.stages[stageIndex];
                const stageName = stage && stage.title ? stage.title : `Stage ${stageIndex}`;
                const isActive = parseInt(stageIndex) === defaultActiveIndex;
                $('#rank_pos').css('display', 'inline-flex');
                if(cups_rounds.length===0&&playoff.length===0){
                    $('#group_cup .inline-tabs-wrapper').hide();
                }
                     const stageTitle = $(`
        <a href="javascript:void(0)"
           class="inline-tab-item tab_stand ${isActive ? 'active' : ''}"
           data-target="${stageIndex}">
           ${stageName}
        </a>
    `);

                $('#stages_target').append(stageTitle);
                    if (totalStages === 1) {
                    stageTitle.hide();
                }

                if (teamsByRank.length !== 0) {
                $('.up_key_info'+stageIndex).hide();
                 $('#rank_team').show();
                $('#rank_team_detail').show();

                if (type_champ === 1) {
                    const standingRankId = 'standing_rank' + stageIndex;
                    const $standingRank = $('<div>', {
                        id: standingRankId,
                        class: 'tab_stand' + stageIndex,
                        css: {
                            display: isActive ? 'block' : 'none' //
                        }                    });

                    $('#main_table').append($standingRank);

                    var rank_=$('#standing_rank'+stageIndex);

                    $.each(teamsByRank, function (index, value) {
                         var up = "";
                        var live = "";
                        var svgLive = "";
                        var color = "";
                        var qualified = "";
                        var qualified_color = "";

                        if(value['team_note'] && value['team_note']['color']){
                            color = 'border-color:' + value['team_note']['color'];
                        }


                        if (value.hasOwnProperty('color')) {
                            up = "up";
                            color = 'border-color:' + value['color'];
                        }


                        if (value['standing'] !== 0) {
                            if (value['standing'] === 1) {
                                svgLive = '<svg class="rank-arrow arrow-up" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_4" data-name="Polygon 4"  d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" fill="#39dbbf"></path></svg>';
                            } else if (value['standing'] === 2) {
                                svgLive = '<svg class="rank-arrow arrow-down" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_7" data-name="Polygon 7" d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" transform="translate(12 5) rotate(180)" fill="#fc4d4d"></path></svg>';
                            }
                            $('.up_key_info'+stageIndex).show();
                        }

                        var teamName = value.team_name || {};

                        var teamRow = teamName.row_id || value.row || null;
                        var teamLink = teamName.link || "";
                        var teamImage = teamName.image || "";
                        var shortTitle = teamName.short_title || value.name || "";

                        var play = value['play'];
                        var wins = value['wins'];
                        var draw = value['draw'];
                        var lose = value['lose'];
                        var against = value['against'];
                        var goalsFor = value['for'];
                        var diff = value['diff'];
                        var points = value['points'];
                        var yellow = value['yellow'];
                        var red = value['red'];
                        var ischampion = value['ischampion'];
                        var isqualified = value['isqualified'];
                        var qualified_name = value['qualified_name'];
                        var live_match = value['live_match'];
                        var score_live = '';


                        if(teamRow===home_team || teamRow===away_team){
                            live = "live";
                        }
                        if (live === 'live') {
                            $('.up_key_info'+stageIndex).show();
                        }
                        if (live_match && live_match.score) {
                            score_live = `<a href="javascript:void(0)" class="live-result ${live_match.type}">${live_match.score}</a>`;
                            $('.up_key_info'+stageIndex).show();
                        }

                        if(ischampion===1){
                            svgLive = '<svg xmlns="http://www.w3.org/2000/svg" width="14.089" height="25.724" viewBox="0 0 14.089 25.724">\n' +
                                '  <g id="Layer_6" data-name="Layer 6" transform="translate(-7.86 -1.147)">\n' +
                                '    <path id="Path_53644" data-name="Path 53644" d="M9.474,10.47h0v.043a13.432,13.432,0,0,0,3.669,4.7,10.386,10.386,0,0,0,.865.64h0c.294.2.6.4.865.58a7.523,7.523,0,0,0,.865-.58h0a10.385,10.385,0,0,0,.865-.64,13.259,13.259,0,0,0,3.15-3.7c.19-.329.363-.675.528-1.021h0v0l.052-.113v-.069a13.414,13.414,0,0,0,.658-1.8h0V8.437c.1-.363.182-.727.251-1.1h0a13.475,13.475,0,0,0,.234-2.467l-5.66-3.5a1.662,1.662,0,0,0-1.679,0L8.21,4.784A13.449,13.449,0,0,0,9.474,10.47Z" transform="translate(-0.047)" fill="#e6a900"></path>\n' +
                                '    <path id="Path_53645" data-name="Path 53645" d="M15.121,19.117l-.216.13-.216-.13a14.1,14.1,0,0,1-1.566-1.047v2.891h3.566V18.07a14.1,14.1,0,0,1-1.566,1.047Zm5.513,6.491H9.175A1.315,1.315,0,0,0,7.86,26.915v1.731a.5.5,0,0,0,.511.5H21.439a.5.5,0,0,0,.511-.5V26.915a1.315,1.315,0,0,0-1.315-1.307ZM11.365,23.2a1.307,1.307,0,0,0-1.307,1.315v.614a.242.242,0,0,0,0,.078h9.684a.242.242,0,0,0,0-.078v-.614a1.307,1.307,0,0,0-1.3-1.315Zm.286-.692v.147a.242.242,0,0,0,0,.078h6.491a.242.242,0,0,0,0-.078V22.51A1.307,1.307,0,0,0,16.835,21.2H12.94a1.307,1.307,0,0,0-1.29,1.307Z" transform="translate(0 -2.277)" fill="#e6a900"></path>\n' +
                                '  </g>\n' +
                                '</svg>';
                            index='';

                        }

                        if(isqualified===1){
                            qualified='<div class="up-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                                '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                                '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#39dbbf"></circle>\n' +
                                '    <path id="Path_106744" data-name="Path 106744" d="M10.6,15.3a.9.9,0,0,1-.636-.264l-2.7-2.7a.9.9,0,0,1,1.273-1.273L10.6,13.127l3.864-3.864a.9.9,0,0,1,1.273,1.273l-4.5,4.5A.9.9,0,0,1,10.6,15.3Z" transform="translate(0.5 0.35)" fill="#16393a"></path>\n' +
                                '  </g>\n' +
                                '</svg>\n' +
                                ''+qualified_name+'</div>';
                            qualified_color='custom-up';
                        }else if(isqualified===2){
                            qualified='<div class="down-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                            '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                            '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#ee3535"/>\n' +
                            '    <path id="next_1_" data-name="next (1)" d="M1.656,29.636A.747.747,0,1,0,.6,30.693l1.039,1.039H-4.288A.712.712,0,0,0-5,32.445a.712.712,0,0,0,.712.713H1.639L.6,34.2a.747.747,0,0,0,1.056,1.056l2.708-2.707a.143.143,0,0,0,0-.2Z" transform="translate(44.472 12) rotate(90)" fill="#191d2d"/>\n' +
                            '  </g>\n' +
                            '</svg>' +
                                ''+qualified_name+'</div>';
                            qualified_color='custom-down';
                        }


                        if(value['team_note'] && value['team_note']['title']){
                            qualified= '<div style="color: '+value['team_note']['color']+'">'+value['team_note']['title']+'</div>';
                        }


                        var rankRow = `
        <div class="rank-row ${qualified_color} ${live} ${up}" style="${color}">
            <div class="rank-group main">
                <div class="rank-col number">${index}${svgLive}</div>
                <div class="rank-col name"><a href="${teamLink}">
                    <div class="team-name"><img src="${teamImage}"><div class="info">${shortTitle}${qualified}</div></div>
                </a>${score_live}</div>
            </div>
            <div class="rank-group matches results">
                <div class="rank-col played">${play}</div>
                <div class="rank-col win">${wins}</div>
                <div class="rank-col equal">${draw}</div>
                <div class="rank-col lose">${lose}</div>
            </div>
            <div class="rank-group mr-auto">
                <div class="rank-col goals">${against}:${goalsFor}</div>
                <div class="rank-col diff">${diff}</div>
                <div class="rank-col points white">${points}</div>
            </div>

        </div>
    `;

                        rank_.append(rankRow);

                    });

                } else {


                    const standingRankId = 'group_rank' + stageIndex;
                    const $standingRank = $('<div>', {
                        id: standingRankId,
                        class: 'tab_stand' + stageIndex,
                        css: {
                            display: isActive ? 'block' : 'none' //
                        }                    });


                        $('#main_table_g').append($standingRank);

                    const clubs = main_table_g.attr('clubs'), play = main_table_g.attr('play'),
                        goals = main_table_g.attr('goals'), diff = main_table_g.attr('diff'),
                        win = main_table_g.attr('win'), draw = main_table_g.attr('draw'),
                        lose = main_table_g.attr('lose'), points = main_table_g.attr('points'),
                        group = main_table_g.attr('group');

                     $.each(teamsByRank, function (index, value_A) {
                        var group_name = "group_" + index + stageIndex;
                        var group_name_is = group+' '+ index;

                        if(value_A[1]['group_name'] !=null){
                            group_name_is =value_A[1]['group_name'] ;
                        }
                        $('#'+standingRankId).append('  <div class="collapse-item-wrap groups-item ' + index + '">\n' +
                            '                                <div class="rank-row header">\n' +
                            '                                    <div class="rank-group main">\n' +
                            '                                        <div class="rank-col number"></div>\n' +
                            '                                        <div class="rank-col name">' + clubs + '</div>\n' +
                            '                                    </div>\n' +
                            '                                    <div class="rank-group  matches results">\n' +
                            '                                        <div class="rank-col played">' + play + '</div>\n' +
                            '                                        <div class="rank-col win">' + win + '</div>\n' +
                            '                                        <div class="rank-col equal">' + draw + '</div>\n' +
                            '                                        <div class="rank-col lose">' + lose + '</div>\n' +
                            '                                    </div>\n' +
                            '                                    <div class="rank-group mr-auto">\n' +
                            '                                        <div class="rank-col goals">' + goals + '</div>\n' +
                            '                                        <div class="rank-col diff">' + diff + '</div>\n' +
                            '                                        <div class="rank-col points white">' + points + '</div>\n' +
                            '                                    </div>\n' +
                            '                                </div>\n' +
                            '                              \n' +
                            '                                <div class="collapse-header active">\n' +
                            '                                    <div class="champion-item">\n' +
                            '                                        <div class="title">\n' +
                            '                                            <span>' + group_name_is + '</span>\n' +
                            '                                        </div>\n' +
                            '                                        <div class="actions">\n' +
                            '                                            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="11" viewBox="0 0 6 11">\n' +
                            '                                                <path id="Shape" d="M4.189,5.5.22,9.659a.812.812,0,0,0,0,1.111.726.726,0,0,0,1.061,0l4.5-4.714a.812.812,0,0,0,0-1.111L1.28.23A.726.726,0,0,0,.22.23a.812.812,0,0,0,0,1.111Z" transform="translate(0 0)" fill="#707488"></path>\n' +
                            '                                            </svg>\n' +
                            '                                        </div>\n' +
                            '                                    </div>\n' +
                            '                                </div>\n' +
                            '                                <div class="collapse-content" style="">\n' +
                            '                                    <div id="' + group_name + '" class="ranking-table">\n' +
                            '                                    </div>\n' +
                            '                                </div>\n' +
                            '                                </div>');

                        $.each(teamsByRank[index], function (index_g, value) {
                            var up_g = "";
                            var live_g = "";
                            var svg_live_g = "";
                            var color_g = "";
                            var qualified = "";
                            var qualified_color = "";

                            if(value['team_note'] && value['team_note']['color']){
                                color_g = 'border-color:' + value['team_note']['color'];
                            }

                            if (value.hasOwnProperty('color')) {
                                up_g = "up";
                                color_g = 'border-color:' + value['color'];
                            }

                            if (value['standing'] !== 0) {
                                if (value['standing'] === 1) {
                                    svg_live_g = '<svg class="rank-arrow arrow-up" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_4" data-name="Polygon 4" d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" fill="#39dbbf"></path></svg>';
                                } else if (value['standing'] === 2) {
                                    svg_live_g = '<svg class="rank-arrow arrow-down" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_7" data-name="Polygon 7" d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" transform="translate(12 5) rotate(180)" fill="#fc4d4d"></path></svg>';
                                }
                                $('.up_key_info'+stageIndex).show();
                            }
                            var teamRow = value['team_name']['row_id'];
                            if(teamRow===home_team || teamRow===away_team){
                                live_g = "live";
                                $('.'+ index).attr('id',gg_team_id);
                            }
                           var isqualified = value['isqualified'];
                            var qualified_name = value['qualified_name'];
                            var live_match = value['live_match'];
                            var score_live = '';


                                if (live_match && live_match.score) {
                                    score_live = `<a href="javascript:void(0)" class="live-result ${live_match.type}">${live_match.score}</a>`;
                                }
                                if (live_g === 'live' || (live_match && live_match.score)) {
                                    $('.up_key_info'+stageIndex).show();
                                }
                                if(isqualified===3){
                                svg_live_g = '<svg xmlns="http://www.w3.org/2000/svg" width="14.089" height="25.724" viewBox="0 0 14.089 25.724">\n' +
                                    '  <g id="Layer_6" data-name="Layer 6" transform="translate(-7.86 -1.147)">\n' +
                                    '    <path id="Path_53644" data-name="Path 53644" d="M9.474,10.47h0v.043a13.432,13.432,0,0,0,3.669,4.7,10.386,10.386,0,0,0,.865.64h0c.294.2.6.4.865.58a7.523,7.523,0,0,0,.865-.58h0a10.385,10.385,0,0,0,.865-.64,13.259,13.259,0,0,0,3.15-3.7c.19-.329.363-.675.528-1.021h0v0l.052-.113v-.069a13.414,13.414,0,0,0,.658-1.8h0V8.437c.1-.363.182-.727.251-1.1h0a13.475,13.475,0,0,0,.234-2.467l-5.66-3.5a1.662,1.662,0,0,0-1.679,0L8.21,4.784A13.449,13.449,0,0,0,9.474,10.47Z" transform="translate(-0.047)" fill="#e6a900"></path>\n' +
                                    '    <path id="Path_53645" data-name="Path 53645" d="M15.121,19.117l-.216.13-.216-.13a14.1,14.1,0,0,1-1.566-1.047v2.891h3.566V18.07a14.1,14.1,0,0,1-1.566,1.047Zm5.513,6.491H9.175A1.315,1.315,0,0,0,7.86,26.915v1.731a.5.5,0,0,0,.511.5H21.439a.5.5,0,0,0,.511-.5V26.915a1.315,1.315,0,0,0-1.315-1.307ZM11.365,23.2a1.307,1.307,0,0,0-1.307,1.315v.614a.242.242,0,0,0,0,.078h9.684a.242.242,0,0,0,0-.078v-.614a1.307,1.307,0,0,0-1.3-1.315Zm.286-.692v.147a.242.242,0,0,0,0,.078h6.491a.242.242,0,0,0,0-.078V22.51A1.307,1.307,0,0,0,16.835,21.2H12.94a1.307,1.307,0,0,0-1.29,1.307Z" transform="translate(0 -2.277)" fill="#e6a900"></path>\n' +
                                    '  </g>\n' +
                                    '</svg>';
                                index_g='';

                            }

                            if(isqualified===1){
                                qualified='<div class="up-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                                    '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                                    '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#39dbbf"></circle>\n' +
                                    '    <path id="Path_106744" data-name="Path 106744" d="M10.6,15.3a.9.9,0,0,1-.636-.264l-2.7-2.7a.9.9,0,0,1,1.273-1.273L10.6,13.127l3.864-3.864a.9.9,0,0,1,1.273,1.273l-4.5,4.5A.9.9,0,0,1,10.6,15.3Z" transform="translate(0.5 0.35)" fill="#16393a"></path>\n' +
                                    '  </g>\n' +
                                    '</svg>\n' +
                                    ''+qualified_name+'</div>';
                                qualified_color='custom-up';
                            }else if(isqualified===2){
                                qualified='<div class="down-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                                    '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                                    '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#ee3535"/>\n' +
                                    '    <path id="next_1_" data-name="next (1)" d="M1.656,29.636A.747.747,0,1,0,.6,30.693l1.039,1.039H-4.288A.712.712,0,0,0-5,32.445a.712.712,0,0,0,.712.713H1.639L.6,34.2a.747.747,0,0,0,1.056,1.056l2.708-2.707a.143.143,0,0,0,0-.2Z" transform="translate(44.472 12) rotate(90)" fill="#191d2d"/>\n' +
                                    '  </g>\n' +
                                    '</svg>' +
                                    ''+qualified_name+'</div>';
                                qualified_color='custom-down';
                            }



                            if(value['team_note'] && value['team_note']['title']){
                                qualified= '<div style="color: '+value['team_note']['color']+'">'+value['team_note']['title']+'</div>';
                            }

                            var rankRowGroup = $('<div class="rank-row '+qualified_color+' ' + live_g + ' ' + up_g + '" style="' + color_g + '">' +
                                '<div class="rank-group main">' +
                                '<div class="rank-col number">' + index_g + svg_live_g + '</div>' +
                                '<div class="rank-col name"><a href="' + value['team_name']['link'] + '">' +
                                '<div class="team-name"><img src="' + value['team_name']['image'] + '"><div class="info">' + value['team_name']['short_title'] + ''+qualified+'</div></div>' +
                                '</a>'+score_live+'</div>' +
                                '</div>' +
                                '<div class="rank-group matches results">' +
                                '<div class="rank-col played">' + value['play'] + '</div>' +
                                '<div class="rank-col win">' + value['wins'] + '</div>' +
                                '<div class="rank-col equal">' + value['draw'] + '</div>' +
                                '<div class="rank-col lose">' + value['lose'] + '</div>' +
                                '</div>' +
                                '<div class="rank-group mr-auto">' +
                                '<div class="rank-col goals">' + value['against'] + ':' + value['for'] + '</div>' +
                                '<div class="rank-col diff">' + value['diff'] + '</div>' +
                                '<div class="rank-col points white">' + value['points'] + '</div>' +
                                '</div>' +
                                '</div>');

                            $('#' + group_name).append(rankRowGroup);
                        });


                    });
                    if (totalStages === 1) {
                        const $groupItem = $('#' + gg_team_id);
                        const savedHtml = $groupItem.prop('outerHTML');
                        $groupItem.remove();
                        $('#' + standingRankId).prepend(savedHtml);
                    }
                }

            } else {
                $('#rank_team').hide();
            }
            });
            $.each(match_list_h, function(stageIndex, teamsByRank) {
                const stage = response.stages && response.stages[stageIndex];
                const stageName = stage && stage.title ? stage.title : `Stage ${stageIndex}`;
                const isActive = parseInt(stageIndex) === defaultActiveIndex;


                if (teamsByRank.length !== 0) {
                $('.up_key_info'+stageIndex).hide();
                 $('#rank_team').show();
                $('#rank_team_detail').show();

                if (type_champ === 1) {
                    const standingRankId = 'standing_rank_h' + stageIndex;
                    const $standingRank = $('<div>', {
                        id: standingRankId,
                        class: 'tab_stand' + stageIndex,
                        css: {
                            display: isActive ? 'block' : 'none' //
                        }                    });

                    $('#main_table_h').append($standingRank);

                    var rank_=$('#standing_rank_h'+stageIndex);

                    $.each(teamsByRank, function (index, value) {
                         var up = "";
                        var live = "";
                        var svgLive = "";
                        var color = "";
                        var qualified = "";
                        var qualified_color = "";

                        if(value['team_note'] && value['team_note']['color']){
                            color = 'border-color:' + value['team_note']['color'];
                        }


                        if (value.hasOwnProperty('color')) {
                            up = "up";
                            color = 'border-color:' + value['color'];
                        }


                        if (value['standing'] !== 0) {
                            if (value['standing'] === 1) {
                                svgLive = '<svg class="rank-arrow arrow-up" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_4" data-name="Polygon 4"  d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" fill="#39dbbf"></path></svg>';
                            } else if (value['standing'] === 2) {
                                svgLive = '<svg class="rank-arrow arrow-down" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_7" data-name="Polygon 7" d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" transform="translate(12 5) rotate(180)" fill="#fc4d4d"></path></svg>';
                            }
                            $('.up_key_info'+stageIndex).show();
                        }

                        var teamName = value.team_name || {};

                        var teamRow = teamName.row_id || value.row || null;
                        var teamLink = teamName.link || "";
                        var teamImage = teamName.image || "";
                        var shortTitle = teamName.short_title || value.name || "";

                        var play = value['play'];
                        var wins = value['wins'];
                        var draw = value['draw'];
                        var lose = value['lose'];
                        var against = value['against'];
                        var goalsFor = value['for'];
                        var diff = value['diff'];
                        var points = value['points'];
                        var yellow = value['yellow'];
                        var red = value['red'];
                        var ischampion = value['ischampion'];
                        var isqualified = value['isqualified'];
                        var qualified_name = value['qualified_name'];
                        var live_match = value['live_match'];
                        var score_live = '';


                        if(teamRow===home_team || teamRow===away_team){
                            live = "live";
                        }
                        if (live === 'live') {
                            $('.up_key_info'+stageIndex).show();
                        }
                        if (live_match && live_match.score) {
                            score_live = `<a href="javascript:void(0)" class="live-result ${live_match.type}">${live_match.score}</a>`;
                            $('.up_key_info'+stageIndex).show();
                        }

                        if(ischampion===1){
                            svgLive = '<svg xmlns="http://www.w3.org/2000/svg" width="14.089" height="25.724" viewBox="0 0 14.089 25.724">\n' +
                                '  <g id="Layer_6" data-name="Layer 6" transform="translate(-7.86 -1.147)">\n' +
                                '    <path id="Path_53644" data-name="Path 53644" d="M9.474,10.47h0v.043a13.432,13.432,0,0,0,3.669,4.7,10.386,10.386,0,0,0,.865.64h0c.294.2.6.4.865.58a7.523,7.523,0,0,0,.865-.58h0a10.385,10.385,0,0,0,.865-.64,13.259,13.259,0,0,0,3.15-3.7c.19-.329.363-.675.528-1.021h0v0l.052-.113v-.069a13.414,13.414,0,0,0,.658-1.8h0V8.437c.1-.363.182-.727.251-1.1h0a13.475,13.475,0,0,0,.234-2.467l-5.66-3.5a1.662,1.662,0,0,0-1.679,0L8.21,4.784A13.449,13.449,0,0,0,9.474,10.47Z" transform="translate(-0.047)" fill="#e6a900"></path>\n' +
                                '    <path id="Path_53645" data-name="Path 53645" d="M15.121,19.117l-.216.13-.216-.13a14.1,14.1,0,0,1-1.566-1.047v2.891h3.566V18.07a14.1,14.1,0,0,1-1.566,1.047Zm5.513,6.491H9.175A1.315,1.315,0,0,0,7.86,26.915v1.731a.5.5,0,0,0,.511.5H21.439a.5.5,0,0,0,.511-.5V26.915a1.315,1.315,0,0,0-1.315-1.307ZM11.365,23.2a1.307,1.307,0,0,0-1.307,1.315v.614a.242.242,0,0,0,0,.078h9.684a.242.242,0,0,0,0-.078v-.614a1.307,1.307,0,0,0-1.3-1.315Zm.286-.692v.147a.242.242,0,0,0,0,.078h6.491a.242.242,0,0,0,0-.078V22.51A1.307,1.307,0,0,0,16.835,21.2H12.94a1.307,1.307,0,0,0-1.29,1.307Z" transform="translate(0 -2.277)" fill="#e6a900"></path>\n' +
                                '  </g>\n' +
                                '</svg>';
                            index='';

                        }

                        if(isqualified===1){
                            qualified='<div class="up-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                                '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                                '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#39dbbf"></circle>\n' +
                                '    <path id="Path_106744" data-name="Path 106744" d="M10.6,15.3a.9.9,0,0,1-.636-.264l-2.7-2.7a.9.9,0,0,1,1.273-1.273L10.6,13.127l3.864-3.864a.9.9,0,0,1,1.273,1.273l-4.5,4.5A.9.9,0,0,1,10.6,15.3Z" transform="translate(0.5 0.35)" fill="#16393a"></path>\n' +
                                '  </g>\n' +
                                '</svg>\n' +
                                ''+qualified_name+'</div>';
                            qualified_color='custom-up';
                        }else if(isqualified===2){
                            qualified='<div class="down-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                            '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                            '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#ee3535"/>\n' +
                            '    <path id="next_1_" data-name="next (1)" d="M1.656,29.636A.747.747,0,1,0,.6,30.693l1.039,1.039H-4.288A.712.712,0,0,0-5,32.445a.712.712,0,0,0,.712.713H1.639L.6,34.2a.747.747,0,0,0,1.056,1.056l2.708-2.707a.143.143,0,0,0,0-.2Z" transform="translate(44.472 12) rotate(90)" fill="#191d2d"/>\n' +
                            '  </g>\n' +
                            '</svg>' +
                                ''+qualified_name+'</div>';
                            qualified_color='custom-down';
                        }


                        if(value['team_note'] && value['team_note']['title']){
                            qualified= '<div style="color: '+value['team_note']['color']+'">'+value['team_note']['title']+'</div>';
                        }


                        var rankRow = `
        <div class="rank-row ${qualified_color} ${live} ${up}" style="${color}">
            <div class="rank-group main">
                <div class="rank-col number">${index}${svgLive}</div>
                <div class="rank-col name"><a href="${teamLink}">
                    <div class="team-name"><img src="${teamImage}"><div class="info">${shortTitle}${qualified}</div></div>
                </a>${score_live}</div>
            </div>
            <div class="rank-group matches results">
                <div class="rank-col played">${play}</div>
                <div class="rank-col win">${wins}</div>
                <div class="rank-col equal">${draw}</div>
                <div class="rank-col lose">${lose}</div>
            </div>
            <div class="rank-group mr-auto">
                <div class="rank-col goals">${against}:${goalsFor}</div>
                <div class="rank-col diff">${diff}</div>
                <div class="rank-col points white">${points}</div>
            </div>

        </div>
    `;

                        rank_.append(rankRow);

                    });

                } else {


                    const standingRankId = 'group_rank_h' + stageIndex;
                    const $standingRank = $('<div>', {
                        id: standingRankId,
                        class: 'tab_stand' + stageIndex,
                        css: {
                            display: isActive ? 'block' : 'none' //
                        }                    });


                    $('#main_table_g_h').append($standingRank);

                    const clubs = main_table_g_h.attr('clubs'), play = main_table_g_h.attr('play'),
                        goals = main_table_g_h.attr('goals'), diff = main_table_g_h.attr('diff'),
                        win = main_table_g_h.attr('win'), draw = main_table_g_h.attr('draw'),
                        lose = main_table_g_h.attr('lose'), points = main_table_g_h.attr('points'),
                        group = main_table_g_h.attr('group');

                     $.each(teamsByRank, function (index, value_A) {
                        var group_name = "group_h" + index + stageIndex;
                        var group_name_is = group+' '+ index;

                        if(value_A[1]['group_name'] !=null){
                            group_name_is =value_A[1]['group_name'] ;
                        }
                        $('#'+standingRankId).append('  <div class="collapse-item-wrap groups-item  h_' + index + '">\n' +
                            '                                <div class="rank-row header">\n' +
                            '                                    <div class="rank-group main">\n' +
                            '                                        <div class="rank-col number"></div>\n' +
                            '                                        <div class="rank-col name">' + clubs + '</div>\n' +
                            '                                    </div>\n' +
                            '                                    <div class="rank-group  matches results">\n' +
                            '                                        <div class="rank-col played">' + play + '</div>\n' +
                            '                                        <div class="rank-col win">' + win + '</div>\n' +
                            '                                        <div class="rank-col equal">' + draw + '</div>\n' +
                            '                                        <div class="rank-col lose">' + lose + '</div>\n' +
                            '                                    </div>\n' +
                            '                                    <div class="rank-group mr-auto">\n' +
                            '                                        <div class="rank-col goals">' + goals + '</div>\n' +
                            '                                        <div class="rank-col diff">' + diff + '</div>\n' +
                            '                                        <div class="rank-col points white">' + points + '</div>\n' +
                            '                                    </div>\n' +
                            '                                </div>\n' +
                            '                              \n' +
                            '                                <div class="collapse-header active">\n' +
                            '                                    <div class="champion-item">\n' +
                            '                                        <div class="title">\n' +
                            '                                            <span>' + group_name_is + '</span>\n' +
                            '                                        </div>\n' +
                            '                                        <div class="actions">\n' +
                            '                                            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="11" viewBox="0 0 6 11">\n' +
                            '                                                <path id="Shape" d="M4.189,5.5.22,9.659a.812.812,0,0,0,0,1.111.726.726,0,0,0,1.061,0l4.5-4.714a.812.812,0,0,0,0-1.111L1.28.23A.726.726,0,0,0,.22.23a.812.812,0,0,0,0,1.111Z" transform="translate(0 0)" fill="#707488"></path>\n' +
                            '                                            </svg>\n' +
                            '                                        </div>\n' +
                            '                                    </div>\n' +
                            '                                </div>\n' +
                            '                                <div class="collapse-content" style="">\n' +
                            '                                    <div id="' + group_name + '" class="ranking-table">\n' +
                            '                                    </div>\n' +
                            '                                </div>\n' +
                            '                                </div>');

                        $.each(teamsByRank[index], function (index_g, value) {
                            var up_g = "";
                            var live_g = "";
                            var svg_live_g = "";
                            var color_g = "";
                            var qualified = "";
                            var qualified_color = "";

                            if(value['team_note'] && value['team_note']['color']){
                                color_g = 'border-color:' + value['team_note']['color'];
                            }

                            if (value.hasOwnProperty('color')) {
                                up_g = "up";
                                color_g = 'border-color:' + value['color'];
                            }

                            if (value['standing'] !== 0) {
                                if (value['standing'] === 1) {
                                    svg_live_g = '<svg class="rank-arrow arrow-up" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_4" data-name="Polygon 4" d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" fill="#39dbbf"></path></svg>';
                                } else if (value['standing'] === 2) {
                                    svg_live_g = '<svg class="rank-arrow arrow-down" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_7" data-name="Polygon 7" d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" transform="translate(12 5) rotate(180)" fill="#fc4d4d"></path></svg>';
                                }
                                $('.up_key_info'+stageIndex).show();
                            }
                            var teamRow = value['team_name']['row_id'];
                            if(teamRow===home_team || teamRow===away_team){
                                live_g = "live";
                                $('.h_'+ index).attr('id','h_'+gg_team_id);
                            }
                           var isqualified = value['isqualified'];
                            var qualified_name = value['qualified_name'];
                            var live_match = value['live_match'];
                            var score_live = '';


                                if (live_match && live_match.score) {
                                    score_live = `<a href="javascript:void(0)" class="live-result ${live_match.type}">${live_match.score}</a>`;
                                }
                                if (live_g === 'live' || (live_match && live_match.score)) {
                                    $('.up_key_info'+stageIndex).show();
                                }
                                if(isqualified===3){
                                svg_live_g = '<svg xmlns="http://www.w3.org/2000/svg" width="14.089" height="25.724" viewBox="0 0 14.089 25.724">\n' +
                                    '  <g id="Layer_6" data-name="Layer 6" transform="translate(-7.86 -1.147)">\n' +
                                    '    <path id="Path_53644" data-name="Path 53644" d="M9.474,10.47h0v.043a13.432,13.432,0,0,0,3.669,4.7,10.386,10.386,0,0,0,.865.64h0c.294.2.6.4.865.58a7.523,7.523,0,0,0,.865-.58h0a10.385,10.385,0,0,0,.865-.64,13.259,13.259,0,0,0,3.15-3.7c.19-.329.363-.675.528-1.021h0v0l.052-.113v-.069a13.414,13.414,0,0,0,.658-1.8h0V8.437c.1-.363.182-.727.251-1.1h0a13.475,13.475,0,0,0,.234-2.467l-5.66-3.5a1.662,1.662,0,0,0-1.679,0L8.21,4.784A13.449,13.449,0,0,0,9.474,10.47Z" transform="translate(-0.047)" fill="#e6a900"></path>\n' +
                                    '    <path id="Path_53645" data-name="Path 53645" d="M15.121,19.117l-.216.13-.216-.13a14.1,14.1,0,0,1-1.566-1.047v2.891h3.566V18.07a14.1,14.1,0,0,1-1.566,1.047Zm5.513,6.491H9.175A1.315,1.315,0,0,0,7.86,26.915v1.731a.5.5,0,0,0,.511.5H21.439a.5.5,0,0,0,.511-.5V26.915a1.315,1.315,0,0,0-1.315-1.307ZM11.365,23.2a1.307,1.307,0,0,0-1.307,1.315v.614a.242.242,0,0,0,0,.078h9.684a.242.242,0,0,0,0-.078v-.614a1.307,1.307,0,0,0-1.3-1.315Zm.286-.692v.147a.242.242,0,0,0,0,.078h6.491a.242.242,0,0,0,0-.078V22.51A1.307,1.307,0,0,0,16.835,21.2H12.94a1.307,1.307,0,0,0-1.29,1.307Z" transform="translate(0 -2.277)" fill="#e6a900"></path>\n' +
                                    '  </g>\n' +
                                    '</svg>';
                                index_g='';

                            }

                            if(isqualified===1){
                                qualified='<div class="up-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                                    '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                                    '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#39dbbf"></circle>\n' +
                                    '    <path id="Path_106744" data-name="Path 106744" d="M10.6,15.3a.9.9,0,0,1-.636-.264l-2.7-2.7a.9.9,0,0,1,1.273-1.273L10.6,13.127l3.864-3.864a.9.9,0,0,1,1.273,1.273l-4.5,4.5A.9.9,0,0,1,10.6,15.3Z" transform="translate(0.5 0.35)" fill="#16393a"></path>\n' +
                                    '  </g>\n' +
                                    '</svg>\n' +
                                    ''+qualified_name+'</div>';
                                qualified_color='custom-up';
                            }else if(isqualified===2){
                                qualified='<div class="down-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                                    '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                                    '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#ee3535"/>\n' +
                                    '    <path id="next_1_" data-name="next (1)" d="M1.656,29.636A.747.747,0,1,0,.6,30.693l1.039,1.039H-4.288A.712.712,0,0,0-5,32.445a.712.712,0,0,0,.712.713H1.639L.6,34.2a.747.747,0,0,0,1.056,1.056l2.708-2.707a.143.143,0,0,0,0-.2Z" transform="translate(44.472 12) rotate(90)" fill="#191d2d"/>\n' +
                                    '  </g>\n' +
                                    '</svg>' +
                                    ''+qualified_name+'</div>';
                                qualified_color='custom-down';
                            }

                            if(value['team_note'] && value['team_note']['title']){
                                qualified= '<div style="color: '+value['team_note']['color']+'">'+value['team_note']['title']+'</div>';
                            }

                            var rankRowGroup = $('<div class="rank-row '+qualified_color+' ' + live_g + ' ' + up_g + '" style="' + color_g + '">' +
                                '<div class="rank-group main">' +
                                '<div class="rank-col number">' + index_g + svg_live_g + '</div>' +
                                '<div class="rank-col name"><a href="' + value['team_name']['link'] + '">' +
                                '<div class="team-name"><img src="' + value['team_name']['image'] + '"><div class="info">' + value['team_name']['short_title'] + ''+qualified+'</div></div>' +
                                '</a>'+score_live+'</div>' +
                                '</div>' +
                                '<div class="rank-group matches results">' +
                                '<div class="rank-col played">' + value['play'] + '</div>' +
                                '<div class="rank-col win">' + value['wins'] + '</div>' +
                                '<div class="rank-col equal">' + value['draw'] + '</div>' +
                                '<div class="rank-col lose">' + value['lose'] + '</div>' +
                                '</div>' +
                                '<div class="rank-group mr-auto">' +
                                '<div class="rank-col goals">' + value['against'] + ':' + value['for'] + '</div>' +
                                '<div class="rank-col diff">' + value['diff'] + '</div>' +
                                '<div class="rank-col points white">' + value['points'] + '</div>' +
                                '</div>' +
                                '</div>');

                            $('#' + group_name).append(rankRowGroup);
                        });


                    });

                    if (totalStages === 1) {
                        const $groupItem_h = $('#h_' + gg_team_id);
                        const savedHtml_h = $groupItem_h.prop('outerHTML');
                        $groupItem_h.remove();
                        $('#' + standingRankId).prepend(savedHtml_h);
                    }

                }

            } else {
                $('#rank_team').hide();
            }
            });
            $.each(match_list_a, function(stageIndex, teamsByRank) {
                const stage = response.stages && response.stages[stageIndex];
                const stageName = stage && stage.title ? stage.title : `Stage ${stageIndex}`;
                const isActive = parseInt(stageIndex) === defaultActiveIndex;


                if (teamsByRank.length !== 0) {
                $('.up_key_info'+stageIndex).hide();
                 $('#rank_team').show();
                $('#rank_team_detail').show();

                if (type_champ === 1) {
                    const standingRankId = 'standing_rank_a' + stageIndex;
                    const $standingRank = $('<div>', {
                        id: standingRankId,
                        class: 'tab_stand' + stageIndex,
                        css: {
                            display: isActive ? 'block' : 'none' //
                        }                    });

                    $('#main_table_a').append($standingRank);

                    var rank_=$('#standing_rank_a'+stageIndex);

                    $.each(teamsByRank, function (index, value) {
                         var up = "";
                        var live = "";
                        var svgLive = "";
                        var color = "";
                        var qualified = "";
                        var qualified_color = "";

                        if(value['team_note'] && value['team_note']['color']){
                            color = 'border-color:' + value['team_note']['color'];
                        }


                        if (value.hasOwnProperty('color')) {
                            up = "up";
                            color = 'border-color:' + value['color'];
                        }


                        if (value['standing'] !== 0) {
                            if (value['standing'] === 1) {
                                svgLive = '<svg class="rank-arrow arrow-up" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_4" data-name="Polygon 4"  d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" fill="#39dbbf"></path></svg>';
                            } else if (value['standing'] === 2) {
                                svgLive = '<svg class="rank-arrow arrow-down" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_7" data-name="Polygon 7" d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" transform="translate(12 5) rotate(180)" fill="#fc4d4d"></path></svg>';
                            }
                            $('.up_key_info'+stageIndex).show();
                        }

                        var teamName = value.team_name || {};

                        var teamRow = teamName.row_id || value.row || null;
                        var teamLink = teamName.link || "";
                        var teamImage = teamName.image || "";
                        var shortTitle = teamName.short_title || value.name || "";

                        var play = value['play'];
                        var wins = value['wins'];
                        var draw = value['draw'];
                        var lose = value['lose'];
                        var against = value['against'];
                        var goalsFor = value['for'];
                        var diff = value['diff'];
                        var points = value['points'];
                        var yellow = value['yellow'];
                        var red = value['red'];
                        var ischampion = value['ischampion'];
                        var isqualified = value['isqualified'];
                        var qualified_name = value['qualified_name'];
                        var live_match = value['live_match'];
                        var score_live = '';


                        if(teamRow===home_team || teamRow===away_team){
                            live = "live";
                        }
                        if (live === 'live') {
                            $('.up_key_info'+stageIndex).show();
                        }
                        if (live_match && live_match.score) {
                            score_live = `<a href="javascript:void(0)" class="live-result ${live_match.type}">${live_match.score}</a>`;
                            $('.up_key_info'+stageIndex).show();
                        }

                        if(ischampion===1){
                            svgLive = '<svg xmlns="http://www.w3.org/2000/svg" width="14.089" height="25.724" viewBox="0 0 14.089 25.724">\n' +
                                '  <g id="Layer_6" data-name="Layer 6" transform="translate(-7.86 -1.147)">\n' +
                                '    <path id="Path_53644" data-name="Path 53644" d="M9.474,10.47h0v.043a13.432,13.432,0,0,0,3.669,4.7,10.386,10.386,0,0,0,.865.64h0c.294.2.6.4.865.58a7.523,7.523,0,0,0,.865-.58h0a10.385,10.385,0,0,0,.865-.64,13.259,13.259,0,0,0,3.15-3.7c.19-.329.363-.675.528-1.021h0v0l.052-.113v-.069a13.414,13.414,0,0,0,.658-1.8h0V8.437c.1-.363.182-.727.251-1.1h0a13.475,13.475,0,0,0,.234-2.467l-5.66-3.5a1.662,1.662,0,0,0-1.679,0L8.21,4.784A13.449,13.449,0,0,0,9.474,10.47Z" transform="translate(-0.047)" fill="#e6a900"></path>\n' +
                                '    <path id="Path_53645" data-name="Path 53645" d="M15.121,19.117l-.216.13-.216-.13a14.1,14.1,0,0,1-1.566-1.047v2.891h3.566V18.07a14.1,14.1,0,0,1-1.566,1.047Zm5.513,6.491H9.175A1.315,1.315,0,0,0,7.86,26.915v1.731a.5.5,0,0,0,.511.5H21.439a.5.5,0,0,0,.511-.5V26.915a1.315,1.315,0,0,0-1.315-1.307ZM11.365,23.2a1.307,1.307,0,0,0-1.307,1.315v.614a.242.242,0,0,0,0,.078h9.684a.242.242,0,0,0,0-.078v-.614a1.307,1.307,0,0,0-1.3-1.315Zm.286-.692v.147a.242.242,0,0,0,0,.078h6.491a.242.242,0,0,0,0-.078V22.51A1.307,1.307,0,0,0,16.835,21.2H12.94a1.307,1.307,0,0,0-1.29,1.307Z" transform="translate(0 -2.277)" fill="#e6a900"></path>\n' +
                                '  </g>\n' +
                                '</svg>';
                            index='';

                        }

                        if(isqualified===1){
                            qualified='<div class="up-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                                '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                                '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#39dbbf"></circle>\n' +
                                '    <path id="Path_106744" data-name="Path 106744" d="M10.6,15.3a.9.9,0,0,1-.636-.264l-2.7-2.7a.9.9,0,0,1,1.273-1.273L10.6,13.127l3.864-3.864a.9.9,0,0,1,1.273,1.273l-4.5,4.5A.9.9,0,0,1,10.6,15.3Z" transform="translate(0.5 0.35)" fill="#16393a"></path>\n' +
                                '  </g>\n' +
                                '</svg>\n' +
                                ''+qualified_name+'</div>';
                            qualified_color='custom-up';
                        }else if(isqualified===2){
                            qualified='<div class="down-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                            '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                            '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#ee3535"/>\n' +
                            '    <path id="next_1_" data-name="next (1)" d="M1.656,29.636A.747.747,0,1,0,.6,30.693l1.039,1.039H-4.288A.712.712,0,0,0-5,32.445a.712.712,0,0,0,.712.713H1.639L.6,34.2a.747.747,0,0,0,1.056,1.056l2.708-2.707a.143.143,0,0,0,0-.2Z" transform="translate(44.472 12) rotate(90)" fill="#191d2d"/>\n' +
                            '  </g>\n' +
                            '</svg>' +
                                ''+qualified_name+'</div>';
                            qualified_color='custom-down';
                        }


                        if(value['team_note'] && value['team_note']['title']){
                            qualified= '<div style="color: '+value['team_note']['color']+'">'+value['team_note']['title']+'</div>';
                        }


                        var rankRow = `
        <div class="rank-row ${qualified_color} ${live} ${up}" style="${color}">
            <div class="rank-group main">
                <div class="rank-col number">${index}${svgLive}</div>
                <div class="rank-col name"><a href="${teamLink}">
                    <div class="team-name"><img src="${teamImage}"><div class="info">${shortTitle}${qualified}</div></div>
                </a>${score_live}</div>
            </div>
            <div class="rank-group matches results">
                <div class="rank-col played">${play}</div>
                <div class="rank-col win">${wins}</div>
                <div class="rank-col equal">${draw}</div>
                <div class="rank-col lose">${lose}</div>
            </div>
            <div class="rank-group mr-auto">
                <div class="rank-col goals">${against}:${goalsFor}</div>
                <div class="rank-col diff">${diff}</div>
                <div class="rank-col points white">${points}</div>
            </div>

        </div>
    `;

                        rank_.append(rankRow);

                    });

                } else {


                    const standingRankId = 'group_rank_a' + stageIndex;
                    const $standingRank = $('<div>', {
                        id: standingRankId,
                        class: 'tab_stand' + stageIndex,
                        css: {
                            display: isActive ? 'block' : 'none' //
                        }                    });


                    $('#main_table_g_a').append($standingRank);

                    const clubs = main_table_g_a.attr('clubs'), play = main_table_g_a.attr('play'),
                        goals = main_table_g_a.attr('goals'), diff = main_table_g_a.attr('diff'),
                        win = main_table_g_a.attr('win'), draw = main_table_g_a.attr('draw'),
                        lose = main_table_g_a.attr('lose'), points = main_table_g_a.attr('points'),
                        group = main_table_g_a.attr('group');

                     $.each(teamsByRank, function (index, value_A) {
                        var group_name = "group_a" + index + stageIndex;
                        var group_name_is = group+' '+ index;

                        if(value_A[1]['group_name'] !=null){
                            group_name_is =value_A[1]['group_name'] ;
                        }
                        $('#'+standingRankId).append('  <div class="collapse-item-wrap groups-item  a_' + index + '">\n' +
                            '                                <div class="rank-row header">\n' +
                            '                                    <div class="rank-group main">\n' +
                            '                                        <div class="rank-col number"></div>\n' +
                            '                                        <div class="rank-col name">' + clubs + '</div>\n' +
                            '                                    </div>\n' +
                            '                                    <div class="rank-group  matches results">\n' +
                            '                                        <div class="rank-col played">' + play + '</div>\n' +
                            '                                        <div class="rank-col win">' + win + '</div>\n' +
                            '                                        <div class="rank-col equal">' + draw + '</div>\n' +
                            '                                        <div class="rank-col lose">' + lose + '</div>\n' +
                            '                                    </div>\n' +
                            '                                    <div class="rank-group mr-auto">\n' +
                            '                                        <div class="rank-col goals">' + goals + '</div>\n' +
                            '                                        <div class="rank-col diff">' + diff + '</div>\n' +
                            '                                        <div class="rank-col points white">' + points + '</div>\n' +
                            '                                    </div>\n' +
                            '                                </div>\n' +
                            '                              \n' +
                            '                                <div class="collapse-header active">\n' +
                            '                                    <div class="champion-item">\n' +
                            '                                        <div class="title">\n' +
                            '                                            <span>' + group_name_is + '</span>\n' +
                            '                                        </div>\n' +
                            '                                        <div class="actions">\n' +
                            '                                            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="11" viewBox="0 0 6 11">\n' +
                            '                                                <path id="Shape" d="M4.189,5.5.22,9.659a.812.812,0,0,0,0,1.111.726.726,0,0,0,1.061,0l4.5-4.714a.812.812,0,0,0,0-1.111L1.28.23A.726.726,0,0,0,.22.23a.812.812,0,0,0,0,1.111Z" transform="translate(0 0)" fill="#707488"></path>\n' +
                            '                                            </svg>\n' +
                            '                                        </div>\n' +
                            '                                    </div>\n' +
                            '                                </div>\n' +
                            '                                <div class="collapse-content" style="">\n' +
                            '                                    <div id="' + group_name + '" class="ranking-table">\n' +
                            '                                    </div>\n' +
                            '                                </div>\n' +
                            '                                </div>');

                        $.each(teamsByRank[index], function (index_g, value) {
                            var up_g = "";
                            var live_g = "";
                            var svg_live_g = "";
                            var color_g = "";
                            var qualified = "";
                            var qualified_color = "";

                            if(value['team_note'] && value['team_note']['color']){
                                color_g = 'border-color:' + value['team_note']['color'];
                            }

                            if (value.hasOwnProperty('color')) {
                                up_g = "up";
                                color_g = 'border-color:' + value['color'];
                            }

                            if (value['standing'] !== 0) {
                                if (value['standing'] === 1) {
                                    svg_live_g = '<svg class="rank-arrow arrow-up" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_4" data-name="Polygon 4" d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" fill="#39dbbf"></path></svg>';
                                } else if (value['standing'] === 2) {
                                    svg_live_g = '<svg class="rank-arrow arrow-down" xmlns="http://www.w3.org/2000/svg" width="12" height="5" viewBox="0 0 12 5"><path id="Polygon_7" data-name="Polygon 7" d="M5.36.533a1,1,0,0,1,1.28,0l3.238,2.7A1,1,0,0,1,9.238,5H2.762a1,1,0,0,1-.64-1.768Z" transform="translate(12 5) rotate(180)" fill="#fc4d4d"></path></svg>';
                                }
                                $('.up_key_info'+stageIndex).show();
                            }
                            var teamRow = value['team_name']['row_id'];
                            if(teamRow===home_team || teamRow===away_team){
                                live_g = "live";
                                $('.a_'+ index).attr('id','a_'+gg_team_id);
                            }
                           var isqualified = value['isqualified'];
                            var qualified_name = value['qualified_name'];
                            var live_match = value['live_match'];
                            var score_live = '';


                                if (live_match && live_match.score) {
                                    score_live = `<a href="javascript:void(0)" class="live-result ${live_match.type}">${live_match.score}</a>`;
                                }
                                if (live_g === 'live' || (live_match && live_match.score)) {
                                    $('.up_key_info'+stageIndex).show();
                                }
                                if(isqualified===3){
                                svg_live_g = '<svg xmlns="http://www.w3.org/2000/svg" width="14.089" height="25.724" viewBox="0 0 14.089 25.724">\n' +
                                    '  <g id="Layer_6" data-name="Layer 6" transform="translate(-7.86 -1.147)">\n' +
                                    '    <path id="Path_53644" data-name="Path 53644" d="M9.474,10.47h0v.043a13.432,13.432,0,0,0,3.669,4.7,10.386,10.386,0,0,0,.865.64h0c.294.2.6.4.865.58a7.523,7.523,0,0,0,.865-.58h0a10.385,10.385,0,0,0,.865-.64,13.259,13.259,0,0,0,3.15-3.7c.19-.329.363-.675.528-1.021h0v0l.052-.113v-.069a13.414,13.414,0,0,0,.658-1.8h0V8.437c.1-.363.182-.727.251-1.1h0a13.475,13.475,0,0,0,.234-2.467l-5.66-3.5a1.662,1.662,0,0,0-1.679,0L8.21,4.784A13.449,13.449,0,0,0,9.474,10.47Z" transform="translate(-0.047)" fill="#e6a900"></path>\n' +
                                    '    <path id="Path_53645" data-name="Path 53645" d="M15.121,19.117l-.216.13-.216-.13a14.1,14.1,0,0,1-1.566-1.047v2.891h3.566V18.07a14.1,14.1,0,0,1-1.566,1.047Zm5.513,6.491H9.175A1.315,1.315,0,0,0,7.86,26.915v1.731a.5.5,0,0,0,.511.5H21.439a.5.5,0,0,0,.511-.5V26.915a1.315,1.315,0,0,0-1.315-1.307ZM11.365,23.2a1.307,1.307,0,0,0-1.307,1.315v.614a.242.242,0,0,0,0,.078h9.684a.242.242,0,0,0,0-.078v-.614a1.307,1.307,0,0,0-1.3-1.315Zm.286-.692v.147a.242.242,0,0,0,0,.078h6.491a.242.242,0,0,0,0-.078V22.51A1.307,1.307,0,0,0,16.835,21.2H12.94a1.307,1.307,0,0,0-1.29,1.307Z" transform="translate(0 -2.277)" fill="#e6a900"></path>\n' +
                                    '  </g>\n' +
                                    '</svg>';
                                index_g='';

                            }

                            if(isqualified===1){
                                qualified='<div class="up-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                                    '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                                    '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#39dbbf"></circle>\n' +
                                    '    <path id="Path_106744" data-name="Path 106744" d="M10.6,15.3a.9.9,0,0,1-.636-.264l-2.7-2.7a.9.9,0,0,1,1.273-1.273L10.6,13.127l3.864-3.864a.9.9,0,0,1,1.273,1.273l-4.5,4.5A.9.9,0,0,1,10.6,15.3Z" transform="translate(0.5 0.35)" fill="#16393a"></path>\n' +
                                    '  </g>\n' +
                                    '</svg>\n' +
                                    ''+qualified_name+'</div>';
                                qualified_color='custom-up';
                            }else if(isqualified===2){
                                qualified='<div class="down-text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                                    '  <g id="icons8-check" transform="translate(-4 -4)">\n' +
                                    '    <circle id="Ellipse_348" data-name="Ellipse 348" cx="8" cy="8" r="8" transform="translate(4 4)" fill="#ee3535"/>\n' +
                                    '    <path id="next_1_" data-name="next (1)" d="M1.656,29.636A.747.747,0,1,0,.6,30.693l1.039,1.039H-4.288A.712.712,0,0,0-5,32.445a.712.712,0,0,0,.712.713H1.639L.6,34.2a.747.747,0,0,0,1.056,1.056l2.708-2.707a.143.143,0,0,0,0-.2Z" transform="translate(44.472 12) rotate(90)" fill="#191d2d"/>\n' +
                                    '  </g>\n' +
                                    '</svg>' +
                                    ''+qualified_name+'</div>';
                                qualified_color='custom-down';
                            }



                            if(value['team_note'] && value['team_note']['title']){
                                qualified= '<div style="color: '+value['team_note']['color']+'">'+value['team_note']['title']+'</div>';
                            }

                            var rankRowGroup = $('<div class="rank-row '+qualified_color+' ' + live_g + ' ' + up_g + '" style="' + color_g + '">' +
                                '<div class="rank-group main">' +
                                '<div class="rank-col number">' + index_g + svg_live_g + '</div>' +
                                '<div class="rank-col name"><a href="' + value['team_name']['link'] + '">' +
                                '<div class="team-name"><img src="' + value['team_name']['image'] + '"><div class="info">' + value['team_name']['short_title'] + ''+qualified+'</div></div>' +
                                '</a>'+score_live+'</div>' +
                                '</div>' +
                                '<div class="rank-group matches results">' +
                                '<div class="rank-col played">' + value['play'] + '</div>' +
                                '<div class="rank-col win">' + value['wins'] + '</div>' +
                                '<div class="rank-col equal">' + value['draw'] + '</div>' +
                                '<div class="rank-col lose">' + value['lose'] + '</div>' +
                                '</div>' +
                                '<div class="rank-group mr-auto">' +
                                '<div class="rank-col goals">' + value['against'] + ':' + value['for'] + '</div>' +
                                '<div class="rank-col diff">' + value['diff'] + '</div>' +
                                '<div class="rank-col points white">' + value['points'] + '</div>' +
                                '</div>' +
                                '</div>');

                            $('#' + group_name).append(rankRowGroup);
                        });
                         if (totalStages === 1) {
                             const $groupItem_a = $('#a_' + gg_team_id);
                             const savedHtml_a = $groupItem_a.prop('outerHTML');
                             $groupItem_a.remove();
                             $('#' + standingRankId).prepend(savedHtml_a);
                         }


                    });

                }

            } else {
                $('#rank_team').hide();
            }
            });

            if (playoff.length !== 0) {

                if(match_list.length===0&&cups_rounds.length===0){
                    $('#group_cup .inline-tabs-wrapper').hide();
                    $('#playoff_detail').attr('style','display:block');
                }

                if (playoff['playoff_teams']) {
                    $('#playoff').show();
                    $('#round_div').empty();
                    $('#playoff_div').empty().append('<div id="playoff_div_teams" class="row"></div>');

                    var teamsHtml = playoff['playoff_teams'].map(function (value) {
                        return `
        <div class="col-6 col-md-4">
            <div class="inline-player-item">
                <a href="${value['team']['link']}" class="player">
                    <div class="img"><img src="${value['team']['image']}"></div>
                    <div class="text">
                        <h5>${value['team']['title']}</h5>
                    </div>
                </a>
            </div>
        </div>
    `;
                    }).join('');

                     $('#playoff_div_teams').append(teamsHtml);

                } else {
                    $('#playoff').show();
                    $('#round_div').empty();
                    $('#playoff_div').empty();
                     var roundHtml = '';

                     $.each(playoff, function (index, val) {
                         roundHtml += `
        <div class="section-title tiny">
            <h3>${val[0]['round_name']}</h3>
        </div>
        <div id="round_teams${index}"></div>
    `;

                         $.each(val, function (index_, value) {
                            var win_team = '';
                            var team_win_type;

                             if (value['winTeam']) {
                                if (value['teamA']['row_id'] === value['winTeam']) {
                                    team_win_type = 'teamA';
                                } else if (value['teamB']['row_id'] === value['winTeam']) {
                                    team_win_type = 'teamB';
                                }
                                win_team = `
                <div class="star">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 10 10">
                        <path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path>
                    </svg>
                </div>
          <span>${value[team_win_type]?.title || ''}</span>
            `;
                            }

                             roundHtml += `
            <div class="collapse-item-wrap match-info-collapse">
                <div class="collapse-header match-collapse round_detail" div_id="${index_}" round="${value['round']}" league_id="${value['league_id']}"
                     teamA="${value['teamA']['row_id']}" teamB="${value['teamB']['row_id']}"
                     teamA_image="${value['teamA']['image']}" teamB_image="${value['teamB']['image']}"
                     teamA_name="${value['teamA']['title']}" teamB_name="${value['teamB']['title']}">
                    <div class="title">${value['teamA']['title']} VS ${value['teamB']['title']}</div>
                    <div class="content">${win_team}</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="6" height="11" viewBox="0 0 6 11">
                        <path id="Shape" d="M4.189,5.5.22,9.659a.812.812,0,0,0,0,1.111.726.726,0,0,0,1.061,0l4.5-4.714a.812.812,0,0,0,0-1.111L1.28.23A.726.726,0,0,0,.22.23a.812.812,0,0,0,0,1.111Z" transform="translate(0 0)" fill="#707488"></path>
                    </svg>
                </div>
                <div id="teams_round_matches${index_}" class="collapse-content" style="display: none">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="50.743" height="50.243" viewBox="0 0 50.743 50.243">
                            <path id="Path_35" data-name="Path 35" d="M-119.131,20h-41.249a1.376,1.376,0,0,0-1.375,1.375h0V51.625A1.376,1.376,0,0,0-160.381,53h41.249a1.376,1.376,0,0,0,1.375-1.375h0V21.375A1.376,1.376,0,0,0-119.131,20Zm-19.249,11.2a5.473,5.473,0,0,1,3.959,6.651,5.473,5.473,0,0,1-3.959,3.959Zm-20.625,0a5.473,5.473,0,0,1,3.959,6.651,5.473,5.473,0,0,1-3.959,3.959Zm17.875,10.61a5.473,5.473,0,0,1-3.959-6.651A5.473,5.473,0,0,1-141.13,31.2Zm0-13.431a8.241,8.241,0,0,0-6.759,9.494,8.24,8.24,0,0,0,6.759,6.759v5.623h-17.877V44.626a8.241,8.241,0,0,0,6.759-9.494,8.242,8.242,0,0,0-6.759-6.759V22.751h17.875Zm20.625,13.431a5.473,5.473,0,0,1-3.959-6.651,5.472,5.472,0,0,1,3.959-3.959Zm0-13.431a8.241,8.241,0,0,0-6.759,9.494,8.24,8.24,0,0,0,6.759,6.759v5.623h-17.875V44.626a8.241,8.241,0,0,0,6.759-9.494,8.242,8.242,0,0,0-6.759-6.759V22.751h17.874Z" transform="translate(163.877 -10.379)" fill="#4c5064"></path>
                            <line id="Line_83" data-name="Line 83" x2="44.5" y2="44" transform="translate(2.121 4.121)" fill="none" stroke="#4c5064" stroke-linecap="round" stroke-width="3"></line>
                            <line id="Line_84" data-name="Line 84" x2="44.5" y2="44" transform="translate(4.121 2.121)" fill="none" stroke="#151825" stroke-linecap="round" stroke-width="3"></line>
                        </svg>
                    </div>
                </div>
            </div>
        `;
                        });
                    });

                     $('#round_div').append(roundHtml);
                }
            } else {
                $('#playoff').hide();
            }

            if (cups_rounds.length !== 0) {
                $('#cups_map').show();
                if(match_list.length===0&&playoff.length===0){
                    $('#group_cup .inline-tabs-wrapper').hide();
                }
                var A_group = Object.keys(cups_rounds['A']).length,
                    B_group = Object.keys(cups_rounds['B']).length;
                if (A_group === 1 && B_group === 1) {
                    round_a_id = "round_Q_A";
                    round_b_id = "round_Q_B";
                    col = "col-12";
                    $('#round_a_16').hide();
                    $('#round_b_16').hide();
                    $('#round_8_A_A').hide();
                    $('#round_8_B_A').hide();
                    $('#4_A1').remove();
                    $('#4_B1').remove();
                    $('.line-2').hide();
                    $('#round_Q_A_A').empty();
                    $('#round_Q_B_A').empty();

                } else if (A_group === 2 && B_group === 2) {
                    round_a_id = "round_8_A";
                    round_b_id = "round_8_B";
                    col = "col-6";
                    $('#round_a_16').hide();
                    $('#round_b_16').hide();
                    $('#round_8_A_A').empty();
                    $('#round_8_B_A').empty();
                } else if (A_group === 4 && B_group === 4) {
                    round_a_id = "round_16_A";
                    round_b_id = "round_16_B";
                    col = "col-6";
                }
                $('#round_16_A_A').empty();
                $('#round_16_A_B').empty();
                $('#round_16_B_A').empty();
                $('#round_16_B_B').empty();

                var re_s_a = "", re_s_b = "", res_a = "", res_b = "", match_info_ = '';

                Object.keys(cups_rounds['A']).sort(function (a, b) {
                    return parseInt(a.replace('A', '')) - parseInt(b.replace('A', ''));
                }).forEach(function (index) {
                    var val = cups_rounds['A'][index];

                    let round_index = '';
                    if (index === 'A1' || index === 'A2') {
                        round_index = "_A";
                    }
                    if (index === 'A3' || index === 'A4') {
                        round_index = "_B";
                    }

                    let re_s_a = '', re_s_b = '', res_a = '', res_b = '';

                    if (val['teamA_score'] > val['teamB_score']) {
                        re_s_a = "win";
                        re_s_b = "";
                    }
                    if (val['teamA_score'] < val['teamB_score']) {
                        re_s_b = "win";
                        re_s_a = "";
                    }

                    if (val['teamA_score'] || val['teamB_score']) {
                        res_a = '<i class="_result ' + re_s_a + '">' + val['teamA_score'] + '</i>';
                        res_b = '<i class="_result ' + re_s_b + '">' + val['teamB_score'] + '</i>';
                    }

                    let match_info_ = 'teamA="' + val['teamA']['row_id'] + '" teamB="' + val['teamB']['row_id'] + '" league_id="' + response.league + '" round="' + val['round_n'] + '" ' +
                        ' teamA_image="' + val['teamA']['image'] + '" teamB_image="' + val['teamB']['image'] + '"' +
                        'teamA_name="' + val['teamA']['title'] + '" teamB_name="' + val['teamB']['title'] + '" winTeam="' + val['winTeam'] + '"';

                    $('#' + round_a_id + round_index).append('<div class="' + col + ' d-flex justify-content-center">\n' +
                        '    <div class="line-match-item">\n' +
                        '        <a href="javascript:void(0)" ' + match_info_ + ' class="get_round_info"  data-toggle="popup" data-target="match_details_popup">\n' +
                        '            <div class="teams">\n' +
                        '                <div class="team-a">' + res_a +
                        '                    <div class="img"><img src="' + val['teamA']['image'] + '"></div>\n' +
                        '                    <span class="full-name">' + val['teamA']['title'] + '</span>\n' +
                        '                    <span class="short-name">' + val['teamA']['short_title'] + '</span>\n' +
                        '                </div>\n' +
                        '                <div class="team-b">' + res_b +
                        '                    <div class="img"><img src="' + val['teamB']['image'] + '"></div>\n' +
                        '                    <span class="full-name">' + val['teamB']['title'] + '</span>\n' +
                        '                    <span class="short-name">' + val['teamB']['short_title'] + '</span>\n' +
                        '                </div>\n' +
                        '            </div>\n' +
                        '        </a><a style="z-index:2;" href="javascript:void(0)" class="get_round_info view-more" ' + match_info_ + ' data-toggle="popup" data-target="match_details_popup">' + detail_ + '</a>' +
                        '    </div>\n' +
                        '</div>');
                });


                Object.keys(cups_rounds['B']).sort(function (a, b) {
                    return parseInt(a.replace('B', '')) - parseInt(b.replace('B', ''));
                }).forEach(function (index) {
                    var val = cups_rounds['B'][index];

                    let round_index = '';
                    if (index === 'B1' || index === 'B2') {
                        round_index = "_A";
                    } else if (index === 'B3' || index === 'B4') {
                        round_index = "_B";
                    }

                    let re_s_a = '', re_s_b = '', res_a = '', res_b = '';

                    if (val['teamA_score'] > val['teamB_score']) {
                        re_s_a = "win";
                        re_s_b = "";
                    } else if (val['teamA_score'] < val['teamB_score']) {
                        re_s_b = "win";
                        re_s_a = "";
                    }

                    if (val['teamA_score'] || val['teamB_score']) {
                        res_a = '<i class="_result ' + re_s_a + '">' + val['teamA_score'] + '</i>';
                        res_b = '<i class="_result ' + re_s_b + '">' + val['teamB_score'] + '</i>';
                    }

                    let match_info_ = 'teamA="' + val['teamA']['row_id'] + '" teamB="' + val['teamB']['row_id'] + '" league_id="' + response.league + '" round="' + val['round_n'] + '" ' +
                        ' teamA_image="' + val['teamA']['image'] + '" teamB_image="' + val['teamB']['image'] + '"' +
                        'teamA_name="' + val['teamA']['title'] + '" teamB_name="' + val['teamB']['title'] + '" winTeam="' + val['winTeam'] + '"';

                    $('#' + round_b_id + round_index).append('<div class="' + col + ' d-flex justify-content-center">\n' +
                        '    <div class="line-match-item">\n' +
                        '        <a href="javascript:void(0)" ' + match_info_ + ' class="get_round_info" data-toggle="popup" data-target="match_details_popup">\n' +
                        '            <div class="teams">\n' +
                        '                <div class="team-a">' + res_a +
                        '                    <div class="img"><img src="' + val['teamA']['image'] + '"></div>\n' +
                        '                    <span class="full-name">' + val['teamA']['title'] + '</span>\n' +
                        '                    <span class="short-name">' + val['teamA']['short_title'] + '</span>\n' +
                        '                </div>' +
                        '                <div class="team-b">' + res_b +
                        '                    <div class="img"><img src="' + val['teamB']['image'] + '"></div>\n' +
                        '                    <span class="full-name">' + val['teamB']['title'] + '</span>\n' +
                        '                    <span class="short-name">' + val['teamB']['short_title'] + '</span>\n' +
                        '                </div>' +
                        '            </div>\n' +
                        '        </a><a style="z-index:2;" href="javascript:void(0)" class="get_round_info view-more" ' + match_info_ + ' data-toggle="popup" data-target="match_details_popup">' + detail_ + '</a>' +
                        '    </div>\n' +
                        '</div>');
                });



                if (cups_rounds['E']) {

                    if (Object.keys(cups_rounds['E']).length !== 0) {

                        $.each(cups_rounds['E'], function (index, val) {
                            let round_8_id = '';
                            let match_info_ = '';
                            let detail_ = ''; // Assuming detail_ is defined elsewhere

                            if (val['position'] === "A1" || val['position'] === "A2") {
                                round_8_id = "round_8_A_A";
                            } else if (val['position'] === "B1" || val['position'] === "B2") {
                                round_8_id = "round_8_B_A";
                            }

                            var re_s_a = "";
                            var re_s_b = "";

                            if (val['teamA_score'] > val['teamB_score']) {
                                re_s_a = "win";
                            } else if (val['teamA_score'] < val['teamB_score']) {
                                re_s_b = "win";
                            }
                            if (val['teamA_score'] || val['teamB_score']) {
                                res_a = '<i class="_result ' + re_s_a + '">' + val['teamA_score'] + '</i>';
                                res_b = '<i class="_result ' + re_s_b + '">' + val['teamB_score'] + '</i>';
                            } else {
                                res_a = '';
                                res_b = '';
                            }

                            match_info_ = `teamA="${val['teamA']['row_id']}" teamB="${val['teamB']['row_id']}" league_id="${response.league}" round="${val['round_n']}" ` +
                                `teamA_image="${val['teamA']['image']}" teamB_image="${val['teamB']['image']}" ` +
                                `teamA_name="${val['teamA']['title']}" teamB_name="${val['teamB']['title']}" winTeam="${val['winTeam']}"`;

                            let targetId = `#8_${val['position']}`;
                            $(targetId).empty().append(`
        <div class="line-match-item">
            <a href="javascript:void(0)" ${match_info_} class="get_round_info" data-toggle="popup" data-target="match_details_popup">
                <div class="teams">
                    <div class="team-a">${res_a}
                        <div class="img"><img src="${val['teamA']['image']}"></div>
                        <span class="full-name">${val['teamA']['title']}</span>
                        <span class="short-name">${val['teamA']['short_title']}</span>
                    </div>
                    <div class="team-b">${res_b}
                        <div class="img"><img src="${val['teamB']['image']}"></div>
                        <span class="full-name">${val['teamB']['title']}</span>
                        <span class="short-name">${val['teamB']['short_title']}</span>
                    </div>
                </div>
            </a>
            <a style="z-index:2;" href="javascript:void(0)" class="get_round_info view-more"  ${match_info_} data-toggle="popup" data-target="match_details_popup">${detail_}</a>
        </div>
    `);
                        });

                    }
                }

                if (cups_rounds['Q']) {
                    if (Object.keys(cups_rounds['Q']).length !== 0) {
                        $.each(cups_rounds['Q'], function (index, val) {
                            if (index === "A1") {
                                round_index = "round_Q_A_A";
                            } else if (index === "B1") {
                                round_index = "round_Q_B_A";
                            }

                            if (val['teamA_score'] > val['teamB_score']) {
                                re_s_a = "win";
                                re_s_b = "";
                            } else if (val['teamA_score'] < val['teamB_score']) {
                                re_s_b = "win";
                                re_s_a = "";
                            }
                            if (val['teamA_score'] || val['teamB_score']) {
                                res_a = '<i class="_result ' + re_s_a + '">' + val['teamA_score'] + '</i>';
                                res_b = '<i class="_result ' + re_s_b + '">' + val['teamB_score'] + '</i>';
                            } else {
                                res_a = '';
                                res_b = '';
                            }

                            match_info_ = 'teamA="' + val['teamA']['row_id'] + '" teamB="' + val['teamB']['row_id'] + '" league_id="' + response.league + '" round="' + val['round_n'] + '" ' +
                                ' teamA_image="' + val['teamA']['image'] + '" teamB_image="' + val['teamB']['image'] + '"' +
                                'teamA_name="' + val['teamA']['title'] + '" teamB_name="' + val['teamB']['title'] + '" winTeam="' + val['winTeam'] + '"';
                            $('#' + round_index).empty().append('<div class="col-12 d-flex justify-content-center">\n' +
                                '                                            <div class="line-match-item">\n' +
                                '                                                <a href="javascript:void(0)" ' + match_info_ + ' class="get_round_info"  data-toggle="popup" data-target="match_details_popup">\n' +
                                '                                                    <div class="teams">\n' +
                                '                                                        <div class="team-a">' + res_a +
                                '                                                            <div class="img"><img src="' + val['teamA']['image'] + '"></div>\n' +
                                '                                                            <span class="full-name">' + val['teamA']['title'] + '</span>\n' +
                                '                                                            <span class="short-name">' + val['teamA']['short_title'] + '</span>\n' +
                                '                                                        </div>' +
                                '                                                        <div class="team-b">' + res_b +
                                '                                                            <div class="img"><img src="' + val['teamB']['image'] + '"></div>\n' +
                                '                                                            <span class="full-name">' + val['teamB']['title'] + '</span>\n' +
                                '                                                            <span class="short-name">' + val['teamB']['short_title'] + '</span>\n' +
                                '                                                        </div>' +
                                '                                                    </div>\n' +
                                '                                                </a><a style="z-index:2;" href="javascript:void(0)" class="get_round_info view-more" ' + match_info_ + ' data-toggle="popup" data-target="match_details_popup">' + detail_ + '</a>' +
                                '                                            </div>\n' +
                                '                                        </div>');

                        });
                    }
                }
                if (cups_rounds['F']) {
                    if (Object.keys(cups_rounds['F']).length !== 0) {
                        var cup_is='';
                        var cup_a='';
                        var cup_b='';
                        var cuptime='';
                        var cupimg_a='';
                        var cupimg_b='';

                        $.each(cups_rounds['F'], function (index, val) {
                            if (val['teamA_score'] > val['teamB_score']) {
                                re_s_a = "win";
                                re_s_b = "";
                            } else if (val['teamA_score'] < val['teamB_score']) {
                                re_s_b = "win";
                                re_s_a = "";
                            }
                            if (val['teamA_score'] || val['teamB_score']) {
                                res_a = '<i class="_result ' + re_s_a + '">' + val['teamA_score'] + '</i>';
                                res_b = '<i class="_result ' + re_s_b + '">' + val['teamB_score'] + '</i>';
                            } else {
                                res_a = '';
                                res_b = '';
                            }

                            if(val['winTeam']===val['teamA']['row_id']){
                                cup_is='cup-a';
                                cuptime='cup-time';
                                cupimg_a='cup-img';
                                cup_a="<div class='"+cup_is+"'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"22\" viewBox=\"0 0 14.089 25.724\">\n" +
                                    "  <g id=\"Layer_6\" data-name=\"Layer 6\" transform=\"translate(-7.86 -1.147)\">\n" +
                                    "    <path id=\"Path_53644\" data-name=\"Path 53644\" d=\"M9.474,10.47h0v.043a13.432,13.432,0,0,0,3.669,4.7,10.386,10.386,0,0,0,.865.64h0c.294.2.6.4.865.58a7.523,7.523,0,0,0,.865-.58h0a10.385,10.385,0,0,0,.865-.64,13.259,13.259,0,0,0,3.15-3.7c.19-.329.363-.675.528-1.021h0v0l.052-.113v-.069a13.414,13.414,0,0,0,.658-1.8h0V8.437c.1-.363.182-.727.251-1.1h0a13.475,13.475,0,0,0,.234-2.467l-5.66-3.5a1.662,1.662,0,0,0-1.679,0L8.21,4.784A13.449,13.449,0,0,0,9.474,10.47Z\" transform=\"translate(-0.047)\" fill=\"#e6a900\"></path>\n" +
                                    "    <path id=\"Path_53645\" data-name=\"Path 53645\" d=\"M15.121,19.117l-.216.13-.216-.13a14.1,14.1,0,0,1-1.566-1.047v2.891h3.566V18.07a14.1,14.1,0,0,1-1.566,1.047Zm5.513,6.491H9.175A1.315,1.315,0,0,0,7.86,26.915v1.731a.5.5,0,0,0,.511.5H21.439a.5.5,0,0,0,.511-.5V26.915a1.315,1.315,0,0,0-1.315-1.307ZM11.365,23.2a1.307,1.307,0,0,0-1.307,1.315v.614a.242.242,0,0,0,0,.078h9.684a.242.242,0,0,0,0-.078v-.614a1.307,1.307,0,0,0-1.3-1.315Zm.286-.692v.147a.242.242,0,0,0,0,.078h6.491a.242.242,0,0,0,0-.078V22.51A1.307,1.307,0,0,0,16.835,21.2H12.94a1.307,1.307,0,0,0-1.29,1.307Z\" transform=\"translate(0 -2.277)\" fill=\"#e6a900\"></path>\n" +
                                    "  </g>\n" +
                                    "</svg></div>";
                            }else  if(val['winTeam']===val['teamB']['row_id']){
                                cup_is='cup-b';
                                cuptime='cup-time';
                                cupimg_b='cup-img';
                                cup_b="<div class='"+cup_is+"'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"22\" viewBox=\"0 0 14.089 25.724\">\n" +
                                    "  <g id=\"Layer_6\" data-name=\"Layer 6\" transform=\"translate(-7.86 -1.147)\">\n" +
                                    "    <path id=\"Path_53644\" data-name=\"Path 53644\" d=\"M9.474,10.47h0v.043a13.432,13.432,0,0,0,3.669,4.7,10.386,10.386,0,0,0,.865.64h0c.294.2.6.4.865.58a7.523,7.523,0,0,0,.865-.58h0a10.385,10.385,0,0,0,.865-.64,13.259,13.259,0,0,0,3.15-3.7c.19-.329.363-.675.528-1.021h0v0l.052-.113v-.069a13.414,13.414,0,0,0,.658-1.8h0V8.437c.1-.363.182-.727.251-1.1h0a13.475,13.475,0,0,0,.234-2.467l-5.66-3.5a1.662,1.662,0,0,0-1.679,0L8.21,4.784A13.449,13.449,0,0,0,9.474,10.47Z\" transform=\"translate(-0.047)\" fill=\"#e6a900\"></path>\n" +
                                    "    <path id=\"Path_53645\" data-name=\"Path 53645\" d=\"M15.121,19.117l-.216.13-.216-.13a14.1,14.1,0,0,1-1.566-1.047v2.891h3.566V18.07a14.1,14.1,0,0,1-1.566,1.047Zm5.513,6.491H9.175A1.315,1.315,0,0,0,7.86,26.915v1.731a.5.5,0,0,0,.511.5H21.439a.5.5,0,0,0,.511-.5V26.915a1.315,1.315,0,0,0-1.315-1.307ZM11.365,23.2a1.307,1.307,0,0,0-1.307,1.315v.614a.242.242,0,0,0,0,.078h9.684a.242.242,0,0,0,0-.078v-.614a1.307,1.307,0,0,0-1.3-1.315Zm.286-.692v.147a.242.242,0,0,0,0,.078h6.491a.242.242,0,0,0,0-.078V22.51A1.307,1.307,0,0,0,16.835,21.2H12.94a1.307,1.307,0,0,0-1.29,1.307Z\" transform=\"translate(0 -2.277)\" fill=\"#e6a900\"></path>\n" +
                                    "  </g>\n" +
                                    "</svg></div>";
                            }else{
                                cup_is='';
                            }

                            match_info_ = 'teamA="' + val['teamA']['row_id'] + '" teamB="' + val['teamB']['row_id'] + '" league_id="' + response.league + '" round="' + val['round_n'] + '" ' +
                                ' teamA_image="' + val['teamA']['image'] + '" teamB_image="' + val['teamB']['image'] + '"' +
                                'teamA_name="' + val['teamA']['title'] + '" teamB_name="' + val['teamB']['title'] + '" winTeam="' + val['winTeam'] + '"';


                            $('#round_F').empty().append('<div class="col-12 d-flex justify-content-center">\n' +
                                '                            <div class="line-match-item">\n' +
                                '                         <a href="javascript:void(0)" ' + match_info_ + ' class="get_round_info"  data-toggle="popup" data-target="match_details_popup">\n' +
                                '                                    <div class="teams">\n' +
                                '                                        <div class="team-a">' + res_a +cup_a+
                                '                                            <div class="img '+cupimg_a+'"><img src="' + val['teamA']['image'] + '"></div>\n' +
                                '                                                            <span class="full-name">' + val['teamA']['title'] + '</span>\n' +
                                '                                                            <span class="short-name">' + val['teamA']['short_title'] + '</span>\n' +
                                '                                                        </div>' +
                                '                                        <div class="time '+cuptime+'">\n' +
                                '                                            <div class="date">' + val['date_'] + '</div>\n' +
                                '                                            <span class="t-time">' + val['time_'] + '</span>\n' +
                                '                                        </div>\n' +
                                '                                        <div class="team-b">' + res_b +cup_b+
                                '                                            <div class="img '+cupimg_b+'"><img src="' + val['teamB']['image'] + '"></div>\n' +
                                '                                                            <span class="full-name">' + val['teamB']['title'] + '</span>\n' +
                                '                                                            <span class="short-name">' + val['teamB']['short_title'] + '</span>\n' +
                                '                                                        </div>' +
                                '                                    </div>\n' +
                                '                                                </a><a style="z-index:2;" href="javascript:void(0)" class="get_round_info view-more" ' + match_info_ + ' data-toggle="popup" data-target="match_details_popup">' + detail_ + '</a>' +
                                '                            </div>\n' +
                                '                        </div>');

                        });
                    }
                }

            } else {
                $('#cups_map').hide();
            }


            if(active_bar===0 && match_list.length===0){
                if (match_list.length !== 0) {
                    $('#rank_team').addClass('active');
                    $('#rank_team_detail').addClass('active');
                    $('#playoff').removeClass('active');
                    $('#cups_map').removeClass('active');
                    $('#playoff_detail').removeClass('active');
                    $('#cups_map_detail').removeClass('active');
                    $('#rank_team').show();
                    $('#rank_team_detail').show();
                    $('#playoff_detail').hide();
                    $('#cups_map_detail').hide();
                }
                if (playoff.length !== 0) {
                    $('#rank_pos').hide();
                    $('#playoff').addClass('active');
                    $('#playoff_detail').addClass('active');
                    $('#rank_team').removeClass('active');
                    $('#cups_map').removeClass('active');
                    $('#rank_team_detail').removeClass('active');
                    $('#cups_map_detail').removeClass('active');
                    $('#playoff').show();
                    $('#playoff_detail').show();
                    $('#rank_team_detail').hide();
                    $('#cups_map_detail').hide();
                }
                if (cups_rounds.length !== 0) {
                    $('#rank_pos').hide();
                    $('#cups_map').addClass('active');
                    $('#cups_map_detail').addClass('active');
                    $('#rank_team').removeClass('active');
                    $('#playoff').removeClass('active');
                    $('#rank_team_detail').removeClass('active');
                    $('#playoff_detail').removeClass('active');
                    $('#cups_map').show();
                    $('#cups_map_detail').show();
                    $('#rank_team_detail').hide();
                    $('#playoff_detail').hide();
                }else {
                    $('#rank_team').removeClass('active');
                    $('#playoff').removeClass('active');
                    $('#cups_map').removeClass('active');
                    $('#rank_team_detail').removeClass('active');
                    $('#cups_map_detail').removeClass('active');
                    $('#playoff_detail').removeClass('active');
                }
            }else{
                if (active_bar=== 0) {
                    $('#rank_team').addClass('active');
                    $('#rank_team_detail').addClass('active');
                    $('#playoff').removeClass('active');
                    $('#cups_map').removeClass('active');
                    $('#playoff_detail').removeClass('active');
                    $('#cups_map_detail').removeClass('active');
                    $('#rank_team').show();
                    $('#rank_team_detail').show();
                    $('#playoff_detail').hide();
                    $('#cups_map_detail').hide();
                }else if(active_bar=== 1){
                    $('#rank_pos').hide();
                    $('#playoff').addClass('active');
                    $('#playoff_detail').addClass('active');
                    $('#cups_map').removeClass('active');
                    $('#cups_map_detail').removeClass('active');
                    $('#rank_team').removeClass('active');
                    $('#rank_team_detail').removeClass('active');
                    $('#playoff').show();
                    $('#playoff_detail').show();
                    $('#rank_team_detail').hide();
                    $('#cups_map_detail').hide();
                }else if(active_bar=== 2){
                    $('#rank_pos').hide();
                    $('#cups_map').addClass('active');
                    $('#cups_map_detail').addClass('active');
                    $('#rank_team').removeClass('active');
                    $('#playoff').removeClass('active');
                    $('#rank_team_detail').removeClass('active');
                    $('#playoff_detail').removeClass('active');
                    $('#cups_map').show();
                    $('#cups_map_detail').show();
                    $('#rank_team_detail').hide();
                    $('#playoff_detail').hide();
                }

            }

            if (typeof window.yssSyncRankStagesWrapper === 'function') {
                window.yssSyncRankStagesWrapper();
            }
            if (typeof window.yssSyncRankScopeCurrentLabel === 'function') {
                window.yssSyncRankScopeCurrentLabel();
            }

        },
    });

});

$(document).on('click', '.comm_more', function (e) {
    $('.detail_').click();
    if ($(window).scrollTop() > $('.dynamic-content-area-wrap').offset().top) {
        $('html, body').animate({
            scrollTop: $('.dynamic-content-area-wrap').offset().top
        }, 1000);
    }
});

$(document).on('click', '#comment_match', function (e) {
    var comment_txt = $('#comm_text').val(), comm_m = $('#comment_match'), news_id = $(this).attr('news'),
        meta_content = $('meta[name="_token"]'), report_ = meta_content.attr('report'),
        edit_ = meta_content.attr('edit'), delete_ = meta_content.attr('delete');

    $.ajax({
        headers: {
            'X-CSRF-Token': meta_content.attr('content'),
        },
        url: match_link + "add_comment_match",
        type: "post",
        dataType: "json",
        data: {
            match_code,
            comment_txt,
            news_id,
        },
        success: function (response) {

            if (response.status === true) {
                $('#error_msg').empty();
                $('#comm_text').val('');
                var image = response.row['user']['image'];
                if (image === '') {
                    image = '../../../../../images/unknown-man.svg';
                }
                var svg_user='';
                if(response.row['user']['premium']===1){
                    svg_user ='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16.784" height="20.25" viewBox="0 0 16.784 20.25">\n' +
                        '                                        <defs>\n' +
                        '                                            <linearGradient id="linear-gradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">\n' +
                        '                                                <stop offset="0" stop-color="#ffdc68"/>\n' +
                        '                                                <stop offset="1" stop-color="#e5ba2b"/>\n' +
                        '                                            </linearGradient>\n' +
                        '                                        </defs>\n' +
                        '                                        <g id="exclusive.1e1be47" transform="translate(-3.75 -2.25)">\n' +
                        '                                            <path id="Path_107264" data-name="Path 107264" d="M7.273,16.949a3.145,3.145,0,0,0-.791-.326l-.009,0L5.25,21.133l3.037-1.218L10.293,22.5l1.024-3.777-.074.024-.22.07a2.782,2.782,0,0,1-1.691.12,2.8,2.8,0,0,1-1.319-1.1l-.161-.22a2.907,2.907,0,0,0-.559-.652Z" fill="url(#linear-gradient)"/>\n' +
                        '                                            <path id="Path_107265" data-name="Path 107265" d="M12.806,18.673,13.843,22.5l2.006-2.586,3.037,1.218-1.211-4.469a2.492,2.492,0,0,0-.684.3l-.246.238c-.094.111-.193.247-.314.414l-.161.22a2.8,2.8,0,0,1-1.319,1.1,2.78,2.78,0,0,1-1.691-.12l-.22-.07Z" fill="url(#linear-gradient)"/>\n' +
                        '                                            <path id="Path_107266" data-name="Path 107266" d="M7.7,16.4c.669.487,1.04,1.614,1.844,1.875.776.252,1.734-.433,2.594-.433s1.818.685,2.594.433c.8-.261,1.174-1.387,1.844-1.875s1.86-.5,2.352-1.176.132-1.8.393-2.6c.252-.776,1.209-1.474,1.209-2.334s-.958-1.558-1.209-2.334c-.261-.8.094-1.93-.393-2.6s-1.676-.683-2.352-1.176-1.04-1.614-1.844-1.875c-.776-.252-1.734.433-2.594.433s-1.818-.685-2.594-.433c-.8.261-1.174,1.387-1.844,1.875s-1.86.5-2.352,1.176-.132,1.795-.393,2.6c-.251.776-1.209,1.474-1.209,2.334s.958,1.558,1.209,2.334c.261.8-.094,1.93.393,2.6S7.028,15.9,7.7,16.4Z" fill="url(#linear-gradient)"/>\n' +
                        '                                            <path id="Path_107267" data-name="Path 107267" d="M11.814,5.867a.353.353,0,0,1,.641,0l1.116,2.419a.353.353,0,0,0,.279.2L16.5,8.8a.353.353,0,0,1,.2.61l-1.956,1.809a.353.353,0,0,0-.107.328l.519,2.613a.353.353,0,0,1-.519.377l-2.325-1.3a.353.353,0,0,0-.345,0l-2.325,1.3a.353.353,0,0,1-.519-.377l.519-2.613a.353.353,0,0,0-.107-.328L7.576,9.412a.353.353,0,0,1,.2-.61l2.645-.314a.353.353,0,0,0,.279-.2Z" fill="#131521"/>\n' +
                        '                                        </g>\n' +
                        '                                    </svg>';
                }

                $('#user_comment').prepend('<div id="coment_detail' + response.row['id'] + '" class="comment-item">\n' +
                    '                                <div class="comment-head">\n' +
                    '                                    <div class="commenter"><img src="' + image + '">\n' +
                    '                                        <div class="text"><h3>' + response.row['user']['name'] + ' '+svg_user+'</h3> <span>' + response.row['time'] + '</span></div>\n' +
                    '                                    </div>\n' +
                    '        <div class="comments-actions drop-item active">\n' +
                    '            <a href="javascript:void(0)" class="drop-toggle comment-drop-toggle">\n' +
                    '                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="6" viewBox="0 0 22 6">\n' +
                    '                    <path id="Combined_Shape" data-name="Combined Shape" d="M19,6a3,3,0,1,1,3-3A3,3,0,0,1,19,6Zm0-4a1,1,0,1,0,1,1A1,1,0,0,0,19,2ZM11,6a3,3,0,1,1,3-3A3,3,0,0,1,11,6Zm0-4a1,1,0,1,0,1,1A1,1,0,0,0,11,2ZM3,6A3,3,0,1,1,6,3,3,3,0,0,1,3,6ZM3,2A1,1,0,1,0,4,3,1,1,0,0,0,3,2Z" transform="translate(0)" fill="#b5c6d6"></path>\n' +
                    '                </svg>\n' +
                    '            </a>\n' +
                    '            <div class="drop-item-wrap comments-dropdown">\n' +
                    '                <a href="javascript:void(0)" comment="' + response.row['id'] + '" class="comment-edit">\n' +
                    '                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>\n' +
                    '                    <span>' + edit_ + '</span>\n' +
                    '                </a>\n' +
                    '                <a href="javascript:void(0)" comment="' + response.row['id'] + '" class="comment-remove">\n' +
                    '                    <svg id="remove" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">\n' +
                    '                        <path id="Shape" d="M8.781.209.209,8.781a.714.714,0,0,0,1.01,1.01L9.791,1.219A.714.714,0,0,0,8.781.209Z" fill="#FC4D4D"></path>\n' +
                    '                        <path id="Shape-2" data-name="Shape" d="M.209,1.219,8.781,9.791a.714.714,0,0,0,1.01-1.01L1.219.209a.714.714,0,0,0-1.01,1.01Z" fill="#FC4D4D"></path>\n' +
                    '                    </svg>\n' +
                    '                    <span>' + delete_ + '</span>\n' +
                    '                </a>\n' +
                    '            </div>\n' +
                    '            </div></div>' +
                    '                                <div id="comm' + response.row['id'] + '" class="comment-text">' + response.row['comment'] + '</div>' +
                    '                                <div class="comment-action"><a id="l' + response.row['id'] + '" href="javascript:void(0)" comment="' + response.row['id'] + '" type_c="like" class="comment-like like">\n' +
                    '                                        <svg xmlns="http://www.w3.org/2000/svg" width="17.683" height="18"\n' +
                    '                                             viewBox="0 0 17.683 18">\n' +
                    '                                            <path id="Shape"\n' +
                    '                                                  d="M14.092,18H2.446A2.45,2.45,0,0,1,0,15.545V9.818A2.45,2.45,0,0,1,2.446,7.364H4.363L7.41.486A.815.815,0,0,1,8.155,0a3.268,3.268,0,0,1,3.262,3.272V5.727h3.791a2.452,2.452,0,0,1,2.446,2.824L16.53,15.914A2.447,2.447,0,0,1,14.12,18Z"\n' +
                    '                                                  fill="#707488"></path>\n' +
                    '                                        </svg>\n' +
                    '                                        <span id="like' + response.row['id'] + '">0</span> </a> ' +
                    '                       <a id="d' + response.row['id'] + '" href="javascript:void(0)" comment="' + response.row['id'] + '" type_c="dislike" class="comment-dislike dislike">\n' +
                    '                                        <svg xmlns="http://www.w3.org/2000/svg" width="17.683" height="18"\n' +
                    '                                             viewBox="0 0 17.683 18">\n' +
                    '                                            <path id="Shape"\n' +
                    '                                                  d="M14.092,18H2.446A2.45,2.45,0,0,1,0,15.545V9.818A2.45,2.45,0,0,1,2.446,7.364H4.363L7.41.486A.815.815,0,0,1,8.155,0a3.268,3.268,0,0,1,3.262,3.272V5.727h3.791a2.452,2.452,0,0,1,2.446,2.824L16.53,15.914A2.447,2.447,0,0,1,14.12,18Z"\n' +
                    '                                                  fill="#707488"></path>\n' +
                    '                                        </svg>\n' +
                    '                                        <span id="dislike' + response.row['id'] + '">0</span> </a></div>\n' +
                    '                            </div>');
                comm_m.html(10);
                comm_m.prop('disabled', true);
                setTimeout(function () {
                    $('#comment_match').prop('disabled', false);
                    $('#comment_match_event').prop('disabled', false);
                    $('#comment_match_user').prop('disabled', false);
                }, 10000);
                insert_time(1);
            }
            if (response.status === false) {
                $('#error_msg').html(response.msg);
            }

        },
    });

});


$(document).on('click', '#comment_match_user', function (e) {

    var comment_txt = $('#comm_text_user').val(), comm_m = $('#comment_match_user'),
        parent_comment = $('#comm_text_user').attr('comm_id'), news_id = $(this).attr('news'),
        meta_content = $('meta[name="_token"]'), report_ = meta_content.attr('report'),
        edit_ = meta_content.attr('edit'), delete_ = meta_content.attr('delete');

    $.ajax({
        headers: {
            'X-CSRF-Token': meta_content.attr('content'),
        },
        url: match_link + "add_comment_match",
        type: "post",
        dataType: "json",
        data: {
            match_code,
            parent_comment,
            news_id,
            comment_txt,
        },
        success: function (response) {

            if (response.status === true) {
                $('#error_msg_user').empty();
                $('#comm_text_user').val('');
                var image = response.row['user']['image'];
                if (image === '') {
                    image = '../../../../../images/unknown-man.svg';
                }
                var svg_user='';
                if(response.row['user']['premium']===1){
                    svg_user ='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16.784" height="20.25" viewBox="0 0 16.784 20.25">\n' +
                        '                                        <defs>\n' +
                        '                                            <linearGradient id="linear-gradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">\n' +
                        '                                                <stop offset="0" stop-color="#ffdc68"/>\n' +
                        '                                                <stop offset="1" stop-color="#e5ba2b"/>\n' +
                        '                                            </linearGradient>\n' +
                        '                                        </defs>\n' +
                        '                                        <g id="exclusive.1e1be47" transform="translate(-3.75 -2.25)">\n' +
                        '                                            <path id="Path_107264" data-name="Path 107264" d="M7.273,16.949a3.145,3.145,0,0,0-.791-.326l-.009,0L5.25,21.133l3.037-1.218L10.293,22.5l1.024-3.777-.074.024-.22.07a2.782,2.782,0,0,1-1.691.12,2.8,2.8,0,0,1-1.319-1.1l-.161-.22a2.907,2.907,0,0,0-.559-.652Z" fill="url(#linear-gradient)"/>\n' +
                        '                                            <path id="Path_107265" data-name="Path 107265" d="M12.806,18.673,13.843,22.5l2.006-2.586,3.037,1.218-1.211-4.469a2.492,2.492,0,0,0-.684.3l-.246.238c-.094.111-.193.247-.314.414l-.161.22a2.8,2.8,0,0,1-1.319,1.1,2.78,2.78,0,0,1-1.691-.12l-.22-.07Z" fill="url(#linear-gradient)"/>\n' +
                        '                                            <path id="Path_107266" data-name="Path 107266" d="M7.7,16.4c.669.487,1.04,1.614,1.844,1.875.776.252,1.734-.433,2.594-.433s1.818.685,2.594.433c.8-.261,1.174-1.387,1.844-1.875s1.86-.5,2.352-1.176.132-1.8.393-2.6c.252-.776,1.209-1.474,1.209-2.334s-.958-1.558-1.209-2.334c-.261-.8.094-1.93-.393-2.6s-1.676-.683-2.352-1.176-1.04-1.614-1.844-1.875c-.776-.252-1.734.433-2.594.433s-1.818-.685-2.594-.433c-.8.261-1.174,1.387-1.844,1.875s-1.86.5-2.352,1.176-.132,1.795-.393,2.6c-.251.776-1.209,1.474-1.209,2.334s.958,1.558,1.209,2.334c.261.8-.094,1.93.393,2.6S7.028,15.9,7.7,16.4Z" fill="url(#linear-gradient)"/>\n' +
                        '                                            <path id="Path_107267" data-name="Path 107267" d="M11.814,5.867a.353.353,0,0,1,.641,0l1.116,2.419a.353.353,0,0,0,.279.2L16.5,8.8a.353.353,0,0,1,.2.61l-1.956,1.809a.353.353,0,0,0-.107.328l.519,2.613a.353.353,0,0,1-.519.377l-2.325-1.3a.353.353,0,0,0-.345,0l-2.325,1.3a.353.353,0,0,1-.519-.377l.519-2.613a.353.353,0,0,0-.107-.328L7.576,9.412a.353.353,0,0,1,.2-.61l2.645-.314a.353.353,0,0,0,.279-.2Z" fill="#131521"/>\n' +
                        '                                        </g>\n' +
                        '                                    </svg>';
                }

                $('#user_comment_user').prepend('<div id="coment_detail' + response.row['id'] + '" class="comment-item">\n' +
                    '                                <div class="comment-head">\n' +
                    '                                    <div class="commenter"><img src="' + image + '">\n' +
                    '                                        <div class="text"><h3>' + response.row['user']['name'] + ' '+svg_user+'</h3> <span>' + response.row['time'] + '</span></div>\n' +
                    '                                    </div>\n' +
                    '        <div class="comments-actions drop-item active">\n' +
                    '            <a href="javascript:void(0)" class="drop-toggle comment-drop-toggle">\n' +
                    '                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="6" viewBox="0 0 22 6">\n' +
                    '                    <path id="Combined_Shape" data-name="Combined Shape" d="M19,6a3,3,0,1,1,3-3A3,3,0,0,1,19,6Zm0-4a1,1,0,1,0,1,1A1,1,0,0,0,19,2ZM11,6a3,3,0,1,1,3-3A3,3,0,0,1,11,6Zm0-4a1,1,0,1,0,1,1A1,1,0,0,0,11,2ZM3,6A3,3,0,1,1,6,3,3,3,0,0,1,3,6ZM3,2A1,1,0,1,0,4,3,1,1,0,0,0,3,2Z" transform="translate(0)" fill="#b5c6d6"></path>\n' +
                    '                </svg>\n' +
                    '            </a>\n' +
                    '            <div class="drop-item-wrap comments-dropdown">\n' +
                    '                <a href="javascript:void(0)" comment="' + response.row['id'] + '" class="comment-edit">\n' +
                    '                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>\n' +
                    '                    <span>' + edit_ + '</span>\n' +
                    '                </a>\n' +
                    '                <a href="javascript:void(0)" comment="' + response.row['id'] + '" class="comment-remove">\n' +
                    '                    <svg id="remove" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">\n' +
                    '                        <path id="Shape" d="M8.781.209.209,8.781a.714.714,0,0,0,1.01,1.01L9.791,1.219A.714.714,0,0,0,8.781.209Z" fill="#FC4D4D"></path>\n' +
                    '                        <path id="Shape-2" data-name="Shape" d="M.209,1.219,8.781,9.791a.714.714,0,0,0,1.01-1.01L1.219.209a.714.714,0,0,0-1.01,1.01Z" fill="#FC4D4D"></path>\n' +
                    '                    </svg>\n' +
                    '                    <span>' + delete_ + '</span>\n' +
                    '                </a>\n' +
                    '            </div>\n' +
                    '            </div></div>' +
                    '                                <div id="comm' + response.row['id'] + '" class="comment-text">' + response.row['comment'] + '</div>' +
                    '                                <div class="comment-action"><a id="l' + response.row['id'] + '" href="javascript:void(0)" comment="' + response.row['id'] + '" type_c="like" class="comment-like like">\n' +
                    '                                        <svg xmlns="http://www.w3.org/2000/svg" width="17.683" height="18"\n' +
                    '                                             viewBox="0 0 17.683 18">\n' +
                    '                                            <path id="Shape"\n' +
                    '                                                  d="M14.092,18H2.446A2.45,2.45,0,0,1,0,15.545V9.818A2.45,2.45,0,0,1,2.446,7.364H4.363L7.41.486A.815.815,0,0,1,8.155,0a3.268,3.268,0,0,1,3.262,3.272V5.727h3.791a2.452,2.452,0,0,1,2.446,2.824L16.53,15.914A2.447,2.447,0,0,1,14.12,18Z"\n' +
                    '                                                  fill="#707488"></path>\n' +
                    '                                        </svg>\n' +
                    '                                        <span id="like' + response.row['id'] + '">0</span> </a> ' +
                    '                       <a id="d' + response.row['id'] + '" href="javascript:void(0)" comment="' + response.row['id'] + '" type_c="dislike" class="comment-dislike dislike">\n' +
                    '                                        <svg xmlns="http://www.w3.org/2000/svg" width="17.683" height="18"\n' +
                    '                                             viewBox="0 0 17.683 18">\n' +
                    '                                            <path id="Shape"\n' +
                    '                                                  d="M14.092,18H2.446A2.45,2.45,0,0,1,0,15.545V9.818A2.45,2.45,0,0,1,2.446,7.364H4.363L7.41.486A.815.815,0,0,1,8.155,0a3.268,3.268,0,0,1,3.262,3.272V5.727h3.791a2.452,2.452,0,0,1,2.446,2.824L16.53,15.914A2.447,2.447,0,0,1,14.12,18Z"\n' +
                    '                                                  fill="#707488"></path>\n' +
                    '                                        </svg>\n' +
                    '                                        <span id="dislike' + response.row['id'] + '">0</span> </a></div>\n' +
                    '                            </div>');
                comm_m.html(10);
                comm_m.prop('disabled', true);
                setTimeout(function () {
                    $('#comment_match').prop('disabled', false);
                    $('#comment_match_event').prop('disabled', false);
                    $('#comment_match_user').prop('disabled', false);
                }, 10000);
                insert_time(2);
            }
            if (response.status === false) {
                $('#error_msg_user').html(response.msg);
            }

        },
    });

});


$(document).on('click', '#comment_match_event', function (e) {

    var comment_txt = $('#comm_text_user').val(), comm_m = $('#comment_match_event'),
        parent_event = $('#comm_text_user').attr('event_id'),
        meta_content = $('meta[name="_token"]'), report_ = meta_content.attr('report'),
        edit_ = meta_content.attr('edit'), delete_ = meta_content.attr('delete');

    $.ajax({
        headers: {
            'X-CSRF-Token': meta_content.attr('content'),
        },
        url: match_link + "add_comment_match",
        type: "post",
        dataType: "json",
        data: {
            match_code,
            parent_event,
            comment_txt,
        },
        success: function (response) {

            if (response.status === true) {
                $('#error_msg_user').empty();
                $('#comm_text_user').val('');
                var image = response.row['user']['image'];
                if (image === '') {
                    image = '../../../../../images/unknown-man.svg';
                }
                var svg_user='';
                if(response.row['user']['premium']===1){
                    svg_user ='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16.784" height="20.25" viewBox="0 0 16.784 20.25">\n' +
                        '                                        <defs>\n' +
                        '                                            <linearGradient id="linear-gradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">\n' +
                        '                                                <stop offset="0" stop-color="#ffdc68"/>\n' +
                        '                                                <stop offset="1" stop-color="#e5ba2b"/>\n' +
                        '                                            </linearGradient>\n' +
                        '                                        </defs>\n' +
                        '                                        <g id="exclusive.1e1be47" transform="translate(-3.75 -2.25)">\n' +
                        '                                            <path id="Path_107264" data-name="Path 107264" d="M7.273,16.949a3.145,3.145,0,0,0-.791-.326l-.009,0L5.25,21.133l3.037-1.218L10.293,22.5l1.024-3.777-.074.024-.22.07a2.782,2.782,0,0,1-1.691.12,2.8,2.8,0,0,1-1.319-1.1l-.161-.22a2.907,2.907,0,0,0-.559-.652Z" fill="url(#linear-gradient)"/>\n' +
                        '                                            <path id="Path_107265" data-name="Path 107265" d="M12.806,18.673,13.843,22.5l2.006-2.586,3.037,1.218-1.211-4.469a2.492,2.492,0,0,0-.684.3l-.246.238c-.094.111-.193.247-.314.414l-.161.22a2.8,2.8,0,0,1-1.319,1.1,2.78,2.78,0,0,1-1.691-.12l-.22-.07Z" fill="url(#linear-gradient)"/>\n' +
                        '                                            <path id="Path_107266" data-name="Path 107266" d="M7.7,16.4c.669.487,1.04,1.614,1.844,1.875.776.252,1.734-.433,2.594-.433s1.818.685,2.594.433c.8-.261,1.174-1.387,1.844-1.875s1.86-.5,2.352-1.176.132-1.8.393-2.6c.252-.776,1.209-1.474,1.209-2.334s-.958-1.558-1.209-2.334c-.261-.8.094-1.93-.393-2.6s-1.676-.683-2.352-1.176-1.04-1.614-1.844-1.875c-.776-.252-1.734.433-2.594.433s-1.818-.685-2.594-.433c-.8.261-1.174,1.387-1.844,1.875s-1.86.5-2.352,1.176-.132,1.795-.393,2.6c-.251.776-1.209,1.474-1.209,2.334s.958,1.558,1.209,2.334c.261.8-.094,1.93.393,2.6S7.028,15.9,7.7,16.4Z" fill="url(#linear-gradient)"/>\n' +
                        '                                            <path id="Path_107267" data-name="Path 107267" d="M11.814,5.867a.353.353,0,0,1,.641,0l1.116,2.419a.353.353,0,0,0,.279.2L16.5,8.8a.353.353,0,0,1,.2.61l-1.956,1.809a.353.353,0,0,0-.107.328l.519,2.613a.353.353,0,0,1-.519.377l-2.325-1.3a.353.353,0,0,0-.345,0l-2.325,1.3a.353.353,0,0,1-.519-.377l.519-2.613a.353.353,0,0,0-.107-.328L7.576,9.412a.353.353,0,0,1,.2-.61l2.645-.314a.353.353,0,0,0,.279-.2Z" fill="#131521"/>\n' +
                        '                                        </g>\n' +
                        '                                    </svg>';
                }
                $('#user_comment_user').prepend('<div id="coment_detail' + response.row['id'] + '" class="comment-item">\n' +
                    '                                <div class="comment-head">\n' +
                    '                                    <div class="commenter"><img src="' + image + '">\n' +
                    '                                        <div class="text"><h3>' + response.row['user']['name'] + ' '+svg_user+'</h3> '+svg_user+'<span>' + response.row['time'] + '</span></div>\n' +
                    '                                    </div>\n' +
                    '        <div class="comments-actions drop-item active">\n' +
                    '            <a href="javascript:void(0)" class="drop-toggle comment-drop-toggle">\n' +
                    '                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="6" viewBox="0 0 22 6">\n' +
                    '                    <path id="Combined_Shape" data-name="Combined Shape" d="M19,6a3,3,0,1,1,3-3A3,3,0,0,1,19,6Zm0-4a1,1,0,1,0,1,1A1,1,0,0,0,19,2ZM11,6a3,3,0,1,1,3-3A3,3,0,0,1,11,6Zm0-4a1,1,0,1,0,1,1A1,1,0,0,0,11,2ZM3,6A3,3,0,1,1,6,3,3,3,0,0,1,3,6ZM3,2A1,1,0,1,0,4,3,1,1,0,0,0,3,2Z" transform="translate(0)" fill="#b5c6d6"></path>\n' +
                    '                </svg>\n' +
                    '            </a>\n' +
                    '            <div class="drop-item-wrap comments-dropdown">\n' +
                    '                <a href="javascript:void(0)" comment="' + response.row['id'] + '" class="comment-edit">\n' +
                    '                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>\n' +
                    '                    <span>' + edit_ + '</span>\n' +
                    '                </a>\n' +
                    '                <a href="javascript:void(0)" comment="' + response.row['id'] + '" class="comment-remove">\n' +
                    '                    <svg id="remove" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">\n' +
                    '                        <path id="Shape" d="M8.781.209.209,8.781a.714.714,0,0,0,1.01,1.01L9.791,1.219A.714.714,0,0,0,8.781.209Z" fill="#FC4D4D"></path>\n' +
                    '                        <path id="Shape-2" data-name="Shape" d="M.209,1.219,8.781,9.791a.714.714,0,0,0,1.01-1.01L1.219.209a.714.714,0,0,0-1.01,1.01Z" fill="#FC4D4D"></path>\n' +
                    '                    </svg>\n' +
                    '                    <span>' + delete_ + '</span>\n' +
                    '                </a>\n' +
                    '            </div>\n' +
                    '            </div></div>' +
                    '                                <div id="comm' + response.row['id'] + '" class="comment-text">' + response.row['comment'] + '</div>' +
                    '                                <div class="comment-action"><a id="l' + response.row['id'] + '" href="javascript:void(0)" comment="' + response.row['id'] + '" type_c="like" class="comment-like like">\n' +
                    '                                        <svg xmlns="http://www.w3.org/2000/svg" width="17.683" height="18"\n' +
                    '                                             viewBox="0 0 17.683 18">\n' +
                    '                                            <path id="Shape"\n' +
                    '                                                  d="M14.092,18H2.446A2.45,2.45,0,0,1,0,15.545V9.818A2.45,2.45,0,0,1,2.446,7.364H4.363L7.41.486A.815.815,0,0,1,8.155,0a3.268,3.268,0,0,1,3.262,3.272V5.727h3.791a2.452,2.452,0,0,1,2.446,2.824L16.53,15.914A2.447,2.447,0,0,1,14.12,18Z"\n' +
                    '                                                  fill="#707488"></path>\n' +
                    '                                        </svg>\n' +
                    '                                        <span id="like' + response.row['id'] + '">0</span> </a> ' +
                    '                       <a id="d' + response.row['id'] + '" href="javascript:void(0)" comment="' + response.row['id'] + '" type_c="dislike" class="comment-dislike dislike">\n' +
                    '                                        <svg xmlns="http://www.w3.org/2000/svg" width="17.683" height="18"\n' +
                    '                                             viewBox="0 0 17.683 18">\n' +
                    '                                            <path id="Shape"\n' +
                    '                                                  d="M14.092,18H2.446A2.45,2.45,0,0,1,0,15.545V9.818A2.45,2.45,0,0,1,2.446,7.364H4.363L7.41.486A.815.815,0,0,1,8.155,0a3.268,3.268,0,0,1,3.262,3.272V5.727h3.791a2.452,2.452,0,0,1,2.446,2.824L16.53,15.914A2.447,2.447,0,0,1,14.12,18Z"\n' +
                    '                                                  fill="#707488"></path>\n' +
                    '                                        </svg>\n' +
                    '                                        <span id="dislike' + response.row['id'] + '">0</span> </a></div>\n' +
                    '                            </div>');
                comm_m.html(10);
                comm_m.prop('disabled', true);
                setTimeout(function () {
                    $('#comment_match').prop('disabled', false);
                    $('#comment_match_event').prop('disabled', false);
                    $('#comment_match_user').prop('disabled', false);
                }, 10000);
                insert_time(3);
            }
            if (response.status === false) {
                $('#error_msg_user').html(response.msg);
            }

        },
    });

});

$(document).on('click', '.comm_pop', function (e) {

    var parent_comment = $(this).attr('comm_id'), parent_event = $(this).attr('event_id'),
        more_comm = $("#more_comments_user"),
        news_id = $('#comment_match').attr('news');

    $('#user_comment_user').empty();
    more_comm.removeAttr('comm_id');
    more_comm.removeAttr('event_id');
    $('.player-popup-head').show();
    $('#info_sub').empty();

    if (parent_event && !parent_comment) {


        if (typeof sett_more !== 'undefined' && sett_more !== null) {

            if (sett_more.comments_view === "0") {
                return;
            }
        }

        const status_ = $(this).attr('status'), player_a = $(this).attr('player_a'),
            player_link = $(this).attr('player_link'), player_a_image = $(this).attr('player_a_image'),
            min_ = $(this).attr('min'), event_name_ = $(this).attr('event_name'), player_s = $(this).attr('player_s'),
            player_s_link = $(this).attr('player_s_link'), player_s_image = $(this).attr('player_s_image');
        var svg_comm, html_player_info;
        if (player_s) {
            var player_s_name = player_s;
        } else {
            player_s_name = event_name_;
        }

        if (status_ === "1") {
            svg_comm = '                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"\n' +
                '                                                     viewBox="0 0 16 16">\n' +
                '                                                    <path id="Path_53339" data-name="Path 53339"\n' +
                '                                                          d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z"\n' +
                '                                                          fill="#5bd286"></path>\n' +
                '                                                </svg>\n';
        } else if (status_ === "2") {
            svg_comm = ' <svg xmlns="http://www.w3.org/2000/svg" width="15.082" height="21.334"\n' +
                '                                                     viewBox="0 0 15.082 21.334">\n' +
                '                                                    <path id="Path_53337" data-name="Path 53337"\n' +
                '                                                          d="M-175.26-49.855l-8.208.858a1.94,1.94,0,0,1-2.138-1.813l-.992-16.453a1.94,1.94,0,0,1,1.936-2.056h10.2a1.94,1.94,0,0,1,1.936,2.064l-1,15.6A1.94,1.94,0,0,1-175.26-49.855Z"\n' +
                '                                                          transform="translate(187.102 69.819)" fill="#ffda46"\n' +
                '                                                          stroke="rgba(0,0,0,0)" stroke-width="1"></path>\n' +
                '                                                </svg>';

        } else if (status_ === "3") {
            svg_comm = '                               <svg xmlns="http://www.w3.org/2000/svg" width="15.082"\n' +
                '                                                         height="21.334"\n' +
                '                                                         viewBox="0 0 15.082 21.334">\n' +
                '                                                        <path id="Path_53340" data-name="Path 53340"\n' +
                '                                                              d="M-175.26-49.855l-8.208.858a1.94,1.94,0,0,1-2.138-1.813l-.992-16.453a1.94,1.94,0,0,1,1.936-2.056h10.2a1.94,1.94,0,0,1,1.936,2.064l-1,15.6A1.94,1.94,0,0,1-175.26-49.855Z"\n' +
                '                                                              transform="translate(187.102 69.819)" fill="#fc4d4d"\n' +
                '                                                              stroke="rgba(0,0,0,0)" stroke-width="1"></path>\n' +
                '                                                    </svg>';

        } else if (status_ === "4") {
            svg_comm = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"\n' +
                '                                                     viewBox="0 0 16 16">\n' +
                '                                                    <path id="Path_53339" data-name="Path 53339"\n' +
                '                                                          d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z"\n' +
                '                                                          fill="#fc4d4d"></path>\n' +
                '                                                </svg>';

        } else if (status_ === "5") {
            svg_comm = '<svg xmlns="http://www.w3.org/2000/svg" width="24.729" height="16.447"\n' +
                '                                                     viewBox="0 0 24.729 16.447">\n' +
                '                                                    <path id="Path_53361" data-name="Path 53361"\n' +
                '                                                          d="M44.885,67.14h-.621V54.68a2.3,2.3,0,0,0-2.3-2.3h-17.2a2.3,2.3,0,0,0-2.3,2.3V67.14h-.621a.844.844,0,1,0,0,1.688H44.885a.844.844,0,1,0,0-1.688Zm-4.823,0H35.376V63.1l1.757-1.4a.844.844,0,0,0-1.051-1.321l-2.416,1.651a.844.844,0,0,0-.319.661V67.14h.034V62.692a.844.844,0,0,0-.319-.661l-2.416-1.651A.844.844,0,0,0,29.6,61.7l1.757,1.4v4.04H24.323V54.85a.612.612,0,0,1,.611-.611H41.8a.612.612,0,0,1,.611.611V67.14H40.062Z"\n' +
                '                                                          transform="translate(-21 -52.381)" fill="#5bd286"></path>\n' +
                '                                                    <circle id="Ellipse_274" data-name="Ellipse 274" cx="1.198"\n' +
                '                                                            cy="1.198"\n' +
                '                                                            r="1.198" transform="translate(11.167 6.49)"\n' +
                '                                                            fill="#5bd286"></circle>\n' +
                '                                                    <circle id="Ellipse_275" data-name="Ellipse 275" cx="2.25" cy="2.25"\n' +
                '                                                            r="2.25" transform="translate(4.609 3.12)"\n' +
                '                                                            fill="#5bd286"></circle>\n' +
                '                                                </svg>';

        } else if (status_ === "6") {
            svg_comm = '<svg xmlns="http://www.w3.org/2000/svg" width="29.12" height="16.447"\n' +
                '                                                     viewBox="0 0 29.12 16.447">\n' +
                '                                                    <path id="Path_53361" data-name="Path 53361"\n' +
                '                                                          d="M44.885,67.14h-.621V54.68a2.3,2.3,0,0,0-2.3-2.3h-17.2a2.3,2.3,0,0,0-2.3,2.3V67.14h-.621a.844.844,0,1,0,0,1.688H44.885a.844.844,0,1,0,0-1.688Zm-4.823,0H35.376V63.1l1.757-1.4a.844.844,0,0,0-1.051-1.321l-2.416,1.651a.844.844,0,0,0-.319.661V67.14h.034V62.692a.844.844,0,0,0-.319-.661l-2.416-1.651A.844.844,0,0,0,29.6,61.7l1.757,1.4v4.04H24.323V54.85a.612.612,0,0,1,.611-.611H41.8a.612.612,0,0,1,.611.611V67.14H40.062Z"\n' +
                '                                                          transform="translate(-16.609 -52.381)" fill="#fc4d4d"></path>\n' +
                '                                                    <circle id="Ellipse_274" data-name="Ellipse 274" cx="1.198"\n' +
                '                                                            cy="1.198"\n' +
                '                                                            r="1.198" transform="translate(15.558 6.49)"\n' +
                '                                                            fill="#fc4d4d"></circle>\n' +
                '                                                    <circle id="Ellipse_275" data-name="Ellipse 275" cx="2.25" cy="2.25"\n' +
                '                                                            r="2.25" transform="translate(0 2.12)"\n' +
                '                                                            fill="#fc4d4d"></circle>\n' +
                '                                                </svg>';

        } else if (status_ === "7") {
            svg_comm = ' <svg xmlns="http://www.w3.org/2000/svg" width="18.633" height="19.216"\n' +
                '                                                     viewBox="0 0 18.633 19.216">\n' +
                '                                                    <path id="Path_53339" data-name="Path 53339"\n' +
                '                                                          d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807A6.953,6.953,0,0,1,8,15c-.746,0-.419-.022-1.094-.239l1.6-1.9-1-1.966,2.26.6.985,1.166Zm1.751-2.718L10.567,10.9l1.839-1.752L13.313,8l1.653.681a6.934,6.934,0,0,1-.945,2.871Z"\n' +
                '                                                          fill="#fc4d4d"></path>\n' +
                '                                                    <g id="Union_18" data-name="Union 18"\n' +
                '                                                       transform="translate(-21930.344 -5871.763)" fill="#fc4d4d">\n' +
                '                                                        <path\n' +
                '                                                            d="M 21939.41796875 5889.87890625 C 21938.85546875 5889.87890625 21938.328125 5889.66015625 21937.931640625 5889.2626953125 C 21937.11328125 5888.44384765625 21937.11328125 5887.111328125 21937.931640625 5886.29248046875 L 21939.626953125 5884.5966796875 L 21937.931640625 5882.9013671875 C 21937.11328125 5882.0830078125 21937.11328125 5880.75244140625 21937.927734375 5879.93359375 C 21938.322265625 5879.5341796875 21938.8515625 5879.314453125 21939.416015625 5879.314453125 C 21939.978515625 5879.314453125 21940.505859375 5879.533203125 21940.90234375 5879.9306640625 L 21942.59765625 5881.62548828125 L 21944.29296875 5879.93017578125 C 21944.69140625 5879.53271484375 21945.21875 5879.314453125 21945.779296875 5879.314453125 C 21946.33984375 5879.314453125 21946.8671875 5879.533203125 21947.263671875 5879.9306640625 C 21948.08203125 5880.74951171875 21948.08203125 5882.08203125 21947.263671875 5882.90087890625 L 21945.568359375 5884.5966796875 L 21947.263671875 5886.2919921875 C 21948.08203125 5887.111328125 21948.08203125 5888.44384765625 21947.263671875 5889.2626953125 C 21946.8671875 5889.65966796875 21946.33984375 5889.87841796875 21945.779296875 5889.87841796875 C 21945.220703125 5889.87841796875 21944.6953125 5889.6611328125 21944.296875 5889.26708984375 L 21944.294921875 5889.26513671875 L 21944.29296875 5889.26318359375 L 21942.59765625 5887.56787109375 L 21940.90234375 5889.26318359375 C 21940.505859375 5889.66015625 21939.978515625 5889.87890625 21939.41796875 5889.87890625 Z"\n' +
                '                                                            stroke="none"></path>\n' +
                '                                                        <path\n' +
                '                                                            d="M 21939.416015625 5888.77880859375 C 21939.673828125 5888.77880859375 21939.9296875 5888.68115234375 21940.125 5888.4853515625 L 21942.59765625 5886.01220703125 L 21945.0703125 5888.4853515625 C 21945.46484375 5888.8759765625 21946.095703125 5888.8759765625 21946.486328125 5888.4853515625 C 21946.876953125 5888.09423828125 21946.876953125 5887.4609375 21946.486328125 5887.06982421875 L 21944.013671875 5884.5966796875 L 21946.486328125 5882.12353515625 C 21946.876953125 5881.732421875 21946.876953125 5881.09912109375 21946.486328125 5880.7080078125 C 21946.095703125 5880.3173828125 21945.4609375 5880.3173828125 21945.0703125 5880.7080078125 L 21942.59765625 5883.18115234375 L 21940.125 5880.7080078125 C 21939.732421875 5880.31591796875 21939.09375 5880.31884765625 21938.708984375 5880.7080078125 C 21938.318359375 5881.09912109375 21938.318359375 5881.732421875 21938.708984375 5882.12353515625 L 21941.181640625 5884.5966796875 L 21938.708984375 5887.06982421875 C 21938.318359375 5887.4609375 21938.318359375 5888.09423828125 21938.708984375 5888.4853515625 C 21938.904296875 5888.68115234375 21939.16015625 5888.77880859375 21939.416015625 5888.77880859375 M 21939.41796875 5890.978515625 C 21938.560546875 5890.978515625 21937.7578125 5890.6455078125 21937.15234375 5890.0400390625 C 21935.90625 5888.79248046875 21935.90625 5886.7626953125 21937.15234375 5885.51513671875 L 21938.0703125 5884.5966796875 L 21937.15234375 5883.67919921875 C 21935.908203125 5882.431640625 21935.90625 5880.404296875 21937.1484375 5879.15673828125 C 21937.751953125 5878.54931640625 21938.556640625 5878.21484375 21939.416015625 5878.21484375 C 21940.271484375 5878.21484375 21941.076171875 5878.5478515625 21941.681640625 5879.1533203125 L 21942.59765625 5880.0693359375 L 21943.513671875 5879.15234375 C 21944.123046875 5878.546875 21944.92578125 5878.21484375 21945.779296875 5878.21484375 C 21946.634765625 5878.21484375 21947.4375 5878.5478515625 21948.04296875 5879.1533203125 C 21949.2890625 5880.40087890625 21949.2890625 5882.4306640625 21948.04296875 5883.67822265625 L 21947.125 5884.5966796875 L 21948.04296875 5885.51416015625 C 21949.2890625 5886.7626953125 21949.2890625 5888.79248046875 21948.04296875 5890.0400390625 C 21947.4375 5890.6455078125 21946.634765625 5890.978515625 21945.779296875 5890.978515625 C 21944.9296875 5890.978515625 21944.126953125 5890.64794921875 21943.521484375 5890.048828125 L 21942.59765625 5889.1240234375 L 21941.681640625 5890.041015625 C 21941.076171875 5890.6455078125 21940.2734375 5890.978515625 21939.41796875 5890.978515625 Z"\n' +
                '                                                            stroke="none" fill="#151825"></path>\n' +
                '                                                    </g>\n' +
                '                                                </svg>';

        } else if (status_ === "8") {
            svg_comm = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="17.888"\n' +
                '                                                     viewBox="0 0 14 17.888">\n' +
                '                                                    <path id="next_1_" data-name="next (1)"\n' +
                '                                                          d="M.736,29.657A.819.819,0,0,0-.423,30.816l1.139,1.14H-9.219a.781.781,0,0,0-.781.781.781.781,0,0,0,.781.781H.716L-.423,34.657A.819.819,0,0,0,.736,35.816L3.7,32.847a.156.156,0,0,0,0-.221Z"\n' +
                '                                                          transform="translate(10.25 -29.417)" fill="#5bd286"></path>\n' +
                '                                                    <path id="next_1_2" data-name="next (1)"\n' +
                '                                                          d="M10.736.24A.819.819,0,1,0,9.577,1.4l1.139,1.14H.781a.781.781,0,0,0,0,1.562h9.935L9.577,5.24A.819.819,0,1,0,10.736,6.4L13.7,3.43a.156.156,0,0,0,0-.221Z"\n' +
                '                                                          transform="translate(13.75 17.888) rotate(180)"\n' +
                '                                                          fill="#fc4d4d"></path>\n' +
                '                                                </svg>';

        } else if (status_ === "21") {
            svg_comm = ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"\n' +
                '                                                     viewBox="0 0 16 16">\n' +
                '                                                    <path id="Path_53345" data-name="Path 53345"\n' +
                '                                                          d="M8,0a8,8,0,1,0,8,8A8,8,0,0,0,8,0Zm3.369,8.255a.571.571,0,0,1-.257.257v0L6.541,10.8a.571.571,0,0,1-.827-.514V5.714A.571.571,0,0,1,6.541,5.2l4.571,2.286A.571.571,0,0,1,11.369,8.255Z"\n' +
                '                                                          fill="#bfc3d4"></path>\n' +
                '                                                </svg>';

        } else if (status_ === "22") {
            svg_comm = '<svg xmlns="http://www.w3.org/2000/svg" width="25.729" height="18.826"\n' +
                '                                                     viewBox="0 0 25.729 18.826">\n' +
                '                                                    <path id="Path_53361" data-name="Path 53361"\n' +
                '                                                          d="M44.885,67.14h-.621V54.68a2.3,2.3,0,0,0-2.3-2.3h-17.2a2.3,2.3,0,0,0-2.3,2.3V67.14h-.621a.844.844,0,1,0,0,1.688H44.885a.844.844,0,1,0,0-1.688Zm-19.34,0H24.323V54.85a.612.612,0,0,1,.611-.611H41.8a.612.612,0,0,1,.611.611V67.14H25.545Z"\n' +
                '                                                          transform="translate(-20.5 -50.501)" fill="#707488"\n' +
                '                                                          stroke="rgba(0,0,0,0)" stroke-width="1"></path>\n' +
                '                                                    <circle id="Ellipse_275" data-name="Ellipse 275" cx="2.25" cy="2.25"\n' +
                '                                                            r="2.25" transform="translate(7.109)"\n' +
                '                                                            fill="#fc4d4d"></circle>\n' +
                '                                                </svg>';

        } else {
            svg_comm = '';
        }

        if (status_ === "8") {
            $('.player-popup-head').hide();
            $('#info_sub').html('<div class="player-popup-head exchange">\n' +
                '<div class="inline-player-item">\n' +
                '                                <a href="' + player_link + '" class="player out">\n' +
                '                                    <div class="img"><img src="' + player_a_image + '"></div>\n' +
                '                                    <div class="text" >\n' +
                '                                        <h5 style="color: #FC4D4D">' + player_a + '</h5>\n' +
                '                                    </div>\n' +
                '                                </a>\n' +
                '                                </div><div class="exchange-icon">\n' +
                '                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20.621" viewBox="0 0 32 20.621">\n' +
                '                                        <path id="next_1_" data-name="next (1)" d="M7.177,29.8a1.311,1.311,0,0,0-1.853,1.853l1.823,1.823H-8.75A1.25,1.25,0,0,0-10,34.728a1.25,1.25,0,0,0,1.25,1.25h15.9L5.323,37.8a1.311,1.311,0,1,0,1.853,1.853l4.75-4.75a.25.25,0,0,0,0-.354Z" transform="translate(20 -29.417)" fill="#5bd286"></path>\n' +
                '                                        <path id="next_1_2" data-name="next (1)" d="M7.177,29.8a1.311,1.311,0,0,0-1.853,1.853l1.823,1.823H-8.75A1.25,1.25,0,0,0-10,34.728a1.25,1.25,0,0,0,1.25,1.25h15.9L5.323,37.8a1.311,1.311,0,1,0,1.853,1.853l4.75-4.75a.25.25,0,0,0,0-.354Z" transform="translate(12 50.039) rotate(180)" fill="#fc4d4d"></path>\n' +
                '                                    </svg>\n' +
                '                                    <span>' + min_ + '’ </span>\n' +
                '                                </div>\n' +
                '                               <div class="inline-player-item"><a href="' + player_s_link + '" class="player in">\n' +
                '                                    <div class="img"><img src="' + player_s_image + '"></div>\n' +
                '                                    <div class="text">\n' +
                '                                        <h5 style="color: #5BD286">' + player_s_name + '</h5>\n' +
                '                                    </div>\n' +
                '                                </a>\n' +
                '                            </div> </div>' +
                '        </div>');

        } else {
            html_player_info =
                '<div class="inline-player-item">\n' +
                '                <a href="' + player_link + '" class="player">\n' +
                '                    <div class="img"><img src="' + player_a_image + '"></div>\n' +
                '                    <div class="text">\n' +
                '                        <h5>' + player_a + '</h5>\n' +
                '                        <div class="player-def">\n' +
                '                             <b>' + min_ + '’</b>' + svg_comm +
                '                            <object><span><a style=" color: #BFC3D4; " href="' + player_s_link + '">' + player_s_name + '</a></span></object>\n' +
                '                            \n' +
                '                        </div>\n' +
                '                    </div>\n' +
                '                </a>\n' +
                '            </div>';
        }

        $('#comm_pop_info').empty();
        $('#user_pop_info').removeClass('commenter');
        if(player_link){
        $('#user_pop_info').html(html_player_info);
        }
        $("#comm_text_user").attr('event_id', parent_event);
        more_comm.attr('event_id', parent_event);
        $("#comment_match_user").attr('id', "comment_match_event");

        $.ajax({
            url: match_link + "get_comments_list",
            type: "get",
            data: {
                match_code,
                parent_event,
            },
            success: function (response) {
                $('#is_more').remove();
                $('#comments_users_user').html(response);
                if (response) {
                     let is_more=$('#is_more').attr('more');
                    if(is_more==='0'){
                        $('#more_comments_user').hide();
                    }
                    if(is_more==='1'){
                         $('#more_comments_user').show();
                    }
                }
            },
        });
    }

    if (parent_event && parent_comment) {
        const div_u_img = $('#u_img_' + parent_comment).html(), div_comm = $('#comm' + parent_comment).html();
        $('#user_pop_info').addClass('commenter');
        $("#user_pop_info").html(div_u_img);
        $("#comm_pop_info").html(div_comm);
        $("#comm_text_user").attr('comm_id', parent_comment);
        $("#more_comments_user").attr('comm_id', parent_comment);
        $("#comment_match_event").attr('id', "comment_match_user");
        $("#comm_text_user").attr('event_id', parent_event);

         $.ajax({
            url: match_link + "get_comments_list",
            type: "get",
            data: {
                match_code,
                parent_comment,
                parent_event,
                news_id,
            },
            success: function (response) {
                $('#is_more').remove();
                $('#comments_users_user').html(response);
                if (response) {
                    let is_more=$('#is_more').attr('more');
                    if(is_more==='0'){
                        $('#more_comments_user').hide();
                    }
                    if(is_more==='1'){
                        $('#more_comments_user').show();
                    }
                }
            },
        });
    }

    if (parent_comment && !parent_event) {
        const div_u_img = $('#u_img_' + parent_comment).html(), div_comm = $('#comm' + parent_comment).html();
        $('#user_pop_info').addClass('commenter');
        $("#user_pop_info").html(div_u_img);
        $("#comm_pop_info").html(div_comm);
        $("#comm_text_user").attr('comm_id', parent_comment);
        $("#more_comments_user").attr('comm_id', parent_comment);
        $("#comment_match_event").attr('id', "comment_match_user");

         $.ajax({
            url: match_link + "get_comments_list",
            type: "get",
            data: {
                match_code,
                parent_comment,
                news_id,
            },
            success: function (response) {
                $('#is_more').remove();
                $('#comments_users_user').html(response);
                if (response) {
                    let is_more=$('#is_more').attr('more');
                    if(is_more==='0'){
                        $('#more_comments_user').hide();
                    }
                    if(is_more==='1'){
                        $('#more_comments_user').show();
                    }
                }
            },
        });
    }
});

$(document).on('click', '#more_comments_user', function (e) {
    var comments = $("#comments_users_user .comment-item"), count_comments = comments.length,
        parent_event = $(this).attr('event_id'), parent_comment = $(this).attr('comm_id');
    var loader_is='puff-loader.svg';
    var web_theme = $('html').attr('theme_is');
    if(web_theme==="light"){
        loader_is='puff-loader-light.svg';
    }

    $('#loader_comment_user').html('<img  src="../../../../../images/'+loader_is+'" />');
    $('#user_comment_user').empty();
    if (parent_event) {
        $.ajax({
            url: match_link + "get_comments_list_more",
            type: "get",
            data: {
                count_comments,
                match_code,
                parent_event,
            },
            success: function (response) {
                $('#is_more').remove();
                $('#loader_comment_user img').remove();
                $('#comments_users_user').append(response);
                if (response) {
                    let is_more=$('#is_more').attr('more');
                    if(is_more==='0'){
                        $('#more_comments_user').hide();
                    }
                    if(is_more==='1'){
                        $('#more_comments_user').show();
                    }
                }
                if (!response) {
                    $('#more_comments_user').hide();
                }
            },
        });
    }
    if (parent_comment) {
        $.ajax({
            url: match_link + "get_comments_list_more",
            type: "get",
            data: {
                count_comments,
                match_code,
                parent_comment,
            },
            success: function (response) {
                $('#loader_comment_user img').remove();
                $('#comments_users_user').append(response);

                if (!response) {
                    $('#more_comments_user').hide();
                }
            },
        });
    }
});

$(document).on('click', '.comment-edit', function (e) {
    const comment_ = $(this).attr('comment'), comm_id = $('#comm' + comment_);
    e.preventDefault();
    if (!$(this).hasClass('active')) {
        $(this).addClass('active');
        var $comment_form = '<div id="form_comm' + comment_ + '" class="comment-form ">\n' +
            '                        <textarea maxlength="400" id="edit_' + comment_ + '" type="text" ></textarea>' +
            '                        <button comment="' + comment_ + '" type="submit" class="radius-btn save_edit">\n' +
            '                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17">\n' +
            '                                <path id="Shape" d="M14.5,16.89,8,13.883,1.5,16.89c-.811.374-1.757-.274-1.434-.983l7-15.378a1.1,1.1,0,0,1,1.876,0l7,15.378C16.192,16.473,15.642,17,15,17A1.18,1.18,0,0,1,14.5,16.89Z" fill="#131521"/>\n' +
            '                            </svg>\n' +
            '                        </button>\n' +
            '                    </div>';
        var $this = $(this);
        var $comment_text = comm_id.text();
        comm_id.html($comment_form);
        comm_id.find('textarea').val($comment_text);
        $this.closest('.comments-dropdown').removeClass('active');
    }
});

$(document).on('click', '.save_edit', function (e) {
    const comment_ = $(this).attr('comment'), text_update = $("#edit_" + comment_).val();

    $.ajax({
        headers: {
            'X-CSRF-Token': $('meta[name="_token"]').attr('content'),
        },
        url: match_link + "update_comment_user",
        type: "post",
        dataType: "json",
        data: {
            text_update,
            match_code,
            comment_,
        },
        success: function (response) {
            if (response.status === true) {
                $('#comm' + comment_).html(text_update);
                $('.comment-edit').removeClass('active');
            }
        },
    });

});

$(document).on('click', '.comment-remove', function (e) {
    const comment_ = $(this).attr('comment'), meta_content = $('meta[name="_token"]'),
        alert_msg = meta_content.attr('alert_msg'), yes = meta_content.attr('yes'), no = meta_content.attr('no');
    bootbox.confirm({
        title: 'Delete Alert',
        message: alert_msg,
        buttons: {
            confirm: {
                label: yes,
                className: 'btn-success'
            },
            cancel: {
                label: no,
                className: 'btn-danger'
            }
        },
        callback: function (result) {
            if (result) {
                $.ajax({
                    headers: {
                        'X-CSRF-Token': $('meta[name="_token"]').attr('content'),
                    },
                    url: match_link + "delete_comment_user",
                    type: "post",
                    dataType: "json",
                    data: {
                        comment_,
                    },
                    success: function (response) {
                        if (response.status === true) {
                            $("#coment_detail" + comment_).remove();
                        }
                    },
                });
            }
        }
    });

});

$(document).on('click', '.comment-report', function (e) {
    var comment_ = $(this).attr('comment'), meta_content = $('meta[name="_token"]'),
        news_id = $('#comment_match').attr('news');

    $.ajax({
        headers: {
            'X-CSRF-Token': meta_content.attr('content'),
        },
        url: match_link + "report_comment_user",
        type: "post",
        dataType: "json",
        data: {
            comment_,
        },
        success: function (response) {

            if (response.status === true) {
                toastMessage('success', response.msg);
                $('.comments-dropdown').removeClass('active');

            }
        },
    });

});

$(document).on('click', '.players_rank_tab', function (e) {
    var match_league = $('#match_league').val(), goals_player_league = $('#goals_rank_player_league'),
        assist_player_league = $('#assist_rank_player_league');
    goals_player_league.empty();
    assist_player_league.empty();
    $('#rank_pos').hide();  $('#stages_target').hide();
    $.ajax({
        url: match_link + "get_player_static_league",
        type: "get",
        data: {
            match_league,
        },
        success: function (response) {
            $.each(response.goals, function (index, value) {
                goals_player_league.append('  <div class="rank-row">\n' +
                    '                                        <div class="rank-group main">\n' +
                    '                                            <div class="rank-col number">' + index + '</div>\n' +
                    '                                            <div class="rank-col name"><a target="_blank" href="' + value['player_info']['link'] + '">\n' +
                    '                                                    <div class="team-name player-name">\n' +
                    '                                                        <div class="img"><img src="' + value['player_info']['image'] + '"></div>\n' +
                    '                                                        <div class="text"><span>' + value['player_info']['title'] + '</span>\n' +
                    '                                                            <p>' + value['player_info']['team_name'] + '</p></div>\n' +
                    '                                                    </div>\n' +
                    '                                                </a></div>\n' +
                    '                                        </div>\n' +
                    '                                        <div class="rank-group matches mr-auto">\n' +
                    '                                            <div class="rank-col white">' + value['goals'] + '</div>\n' +
                    '                                            <div class="rank-col" >' + value['score_penalty'] + '</div>\n' +
                    '                                            <div class="rank-col" style="color: red">' + value['miss_penalty'] + '</div>\n' +
                    '                                        </div>\n' +
                    '                                    </div>');
            });
            $.each(response.assist, function (index, value) {
                assist_player_league.append('  <div class="rank-row">\n' +
                    '                                        <div class="rank-group main">\n' +
                    '                                            <div class="rank-col number">' + index + '</div>\n' +
                    '                                            <div class="rank-col name"><a target="_blank" href="' + value['player_info']['link'] + '">\n' +
                    '                                                    <div class="team-name player-name">\n' +
                    '                                                        <div class="img"><img src="' + value['player_info']['image'] + '"></div>\n' +
                    '                                                        <div class="text"><span>' + value['player_info']['title'] + '</span>\n' +
                    '                                                            <p>' + value['player_info']['team_name'] + '</p></div>\n' +
                    '                                                    </div>\n' +
                    '                                                </a></div>\n' +
                    '                                        </div>\n' +
                    '                                        <div class="rank-group matches mr-auto">\n' +
                    '                                            <div class="rank-col white">' + value['assist'] + '</div>\n' +
                    '                                        </div>\n' +
                    '                                    </div>');
            });


        },
    });


});

function insert_time(type) {

    var timeleft = 10;
    var comm_m;
    if (type === 1) {
        comm_m = $('#comment_match');
    } else if (type === 2) {
        comm_m = $('#comment_match_user');
    } else if (type === 3) {
        comm_m = $('#comment_match_event');
    }

    var downloadTimer = setInterval(function () {
        if (timeleft <= 0) {
            clearInterval(downloadTimer);
            comm_m.html('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17">\n' +
                '                                        <path id="Shape" d="M14.5,16.89,8,13.883,1.5,16.89c-.811.374-1.757-.274-1.434-.983l7-15.378a1.1,1.1,0,0,1,1.876,0l7,15.378C16.192,16.473,15.642,17,15,17A1.18,1.18,0,0,1,14.5,16.89Z" fill="#131521"></path>\n' +
                '                                    </svg>');
        } else {
            comm_m.html(timeleft);
        }
        timeleft -= 1;
    }, 1000);
}

$(document).on('click', '.pre', function (e) {

    const type_p = $(this).attr('type_p');

    // 🔥 get data from closest match container
    const parent = $(this).closest('.match-prediction');

    const home_image = parent.attr('home_image');
    const away_image = parent.attr('away_image');
    const match_id = parent.attr('match_id');

    $.ajax({
        headers: {
            'X-CSRF-Token': $('meta[name="_token"]').attr('content'),
        },
        url: match_link + "predictions_save",
        type: "post",
        dataType: "json",
        data: {
            type_p,
            match_code,
        },
        success: function (response) {

            if (response) {

                // update bars
                $('#home_value').attr('data-width', response.home_value + '%');
                $('#draw_value').attr('data-width', response.draw_value + '%');
                $('#away_value').attr('data-width', response.away_value + '%');

                $('.prediction-result-wrap .progress-bar').each(function () {
                    $(this).css('width', $(this).attr('data-width'));
                });

                $('#pre_is').remove();

                // =========================
                // 🔥 UPDATE POPUP
                // =========================

                $('#pre_popup').find('#user_pop_info img')
                    .attr('src', 'https://imgs.ysscores.com/multi_teams/96/' + match_id + '.png');

                // home image
                $('#pre_popup .team-predict-row .img.home')
                    .html('<img src="' + home_image + '">');

                // away image
                $('#pre_popup .team-predict-row .img.away')
                    .html('<img src="' + away_image + '">');

                $('.save_match_pre').attr('match_id',+ match_id);


            }
        },
    });
});
$(document).on('click', '.save_match_pre', function (e) {

    const match_id = $(this).attr('match_id');
    const home_score_pre = $('#home_score_pre').val();
    const away_score_pre = $('#away_score_pre').val();

    $.ajax({
        headers: {
            'X-CSRF-Token': $('meta[name="_token"]').attr('content'),
        },
        url: match_link + "predictions_match_save",
        type: "post",
        dataType: "json",
        data: {
            match_id,
            home_score_pre,
            away_score_pre,
            match_code,
        },
        success: function (response) {

            if (response.status===1) {
                $('#pre_popup').removeClass('active');
                toastMessage('success', response.msg);
            }
        },
    });
});

$(document).on('click', '.channel_info', function (e) {
     var htmlLang = ($('html').attr('lang') || 'ar').toLowerCase();   // e.g. "ar", "fr-fr"
    var $lang = htmlLang.slice(0, 2);                                 // normalize to "ar","en","fr","es"
    var $rtl  = ($lang === 'ar');                                     // rtl only for Arabic

     if ($rtl) { document.documentElement.setAttribute('dir', 'rtl'); }
    else { document.documentElement.removeAttribute('dir'); }

     const fieldsOrder = ["angle","coding","encryption","frequency","patch","polarization"];

    const LABELS = {
        en: {
            angle: "Angle",
            coding: "Symbol rate",
            encryption: "Encryption",
            frequency: "Frequency",
            patch: "FEC",
            polarization: "Polarization",
        },
        ar: {
            angle: "الزاوية",
            coding: "معدل الترميز",
            encryption: "التشفير",
            frequency: "التردد",
            patch: "معامل التصحيح (FEC)",
            polarization: "الاستقطاب",
        },
        fr: {
            angle: "Angle",
            coding: "Débit symbole",
            encryption: "Chiffrement",
            frequency: "Fréquence",
            patch: "FEC",
            polarization: "Polarisation",
        },
        es: {
            angle: "Ángulo",
            coding: "Tasa de símbolos",
            encryption: "Cifrado",
            frequency: "Frecuencia",
            patch: "FEC",
            polarization: "Polarización",
        }
    };

     const T = (key) => (LABELS[$lang] || LABELS.en)[key] || key;

    const c_id = $(this).attr('channel_id');

    $.ajax({
        headers: { 'X-CSRF-Token': $('meta[name="_token"]').attr('content') },
        url: match_link + "channel_info",
        type: "post",
        dataType: "json",
        data: { c_id },
        success: function (response) {
            if (response.status === 1) {

                $('#channel_name').html(response.title);
                $('#channel_country').html(response.country.title);
                $('#channel_img').html('<img src="'+response.image+'">');

                const frequency = Array.isArray(response.frequency) ? response.frequency : [];
                const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m =>
                    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])
                );

                const buildInfoRow = (labelKey, value, hidden) => {
                    if (value == null || value === "") return "";
                    return `
                        <div class="collapse-content"${hidden ? ' style="display:none"' : ''}>
                          <div class="match-info-item sub">
                            <div class="title">${esc(T(labelKey))}</div>
                            <div class="content">
                              <a href="javascript:void(0)" target="_blank">${esc(value)}</a>
                            </div>
                          </div>
                        </div>
                    `;
                };

                const buildItem = (item, idx) => {
                    const hidden = idx > 0; // only hide rows for items after the first
                    let rows = "";
                    fieldsOrder.forEach(key => { rows += buildInfoRow(key, item[key], hidden); });

                    return `
                        <div class="collapse-item-wrap groups-item">
                          <div class="collapse-header">
                            <div class="champion-item">
                              <div class="title">${esc(item.moon || "")}</div>
                              <div class="actions">
                                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="11" viewBox="0 0 6 11">
                                  <path id="Shape" d="M4.189,5.5.22,9.659a.812.812,0,0,0,0,1.111.726.726,0,0,0,1.061,0l4.5-4.714a.812.812,0,0,0,0-1.111L1.28.23A.726.726,0,0,0,.22.23a.812.812,0,0,0,0,1.111Z" transform="translate(0 0)" fill="#707488"></path>
                                </svg>
                              </div>
                            </div>
                          </div>
                          ${rows}
                        </div>
                    `;
                };

                const html = frequency.map((item, idx) => buildItem(item, idx)).join("");
                $('#channel_details').html(html);
                if (Array.isArray(response.links)) {

                    const linkItem = response.links.find(item => item.operation === 'web');

                    if (linkItem) {

                        const btnTitle =
                            $lang === 'ar' ? linkItem.title_ar :
                                $lang === 'fr' ? linkItem.title_fr :
                                    $lang === 'es' ? linkItem.title_es :
                                        linkItem.title_en;

                        const buttonHtml = `
    <div style="width:100%; display:flex; justify-content:center; margin-top:15px;">
        <a href="${esc(linkItem.link)}"
           class="radius-btn login-btn"
           target="_blank"
           style="width:100%; text-align:center; padding:10px 0; display:block;">
           ${esc(btnTitle)}
        </a>
    </div>
`;

                        $('#channel_details').append(buttonHtml);
                    }
                }
            } else {
                $('#channel_details').empty();
            }
        }
    });
});
