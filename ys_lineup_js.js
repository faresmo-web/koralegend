var match_link = $('#web_site_link').attr('link');
var match_code = $('#match_code').val();

function _hasPreloadedLineup() {
    return typeof window.__LINEUP_PRELOADED__ !== 'undefined'
        && window.__LINEUP_PRELOADED__
        && window.__LINEUP_PRELOADED__.info;
}

var _lineupRenderedFromPreload = false;
if (_hasPreloadedLineup()) {
    try {
        renderLineup(window.__LINEUP_PRELOADED__);
        _lineupRenderedFromPreload = true;
    } catch (e) {
        _lineupRenderedFromPreload = false;
    }
}

$(document).ready(function () {

    if (_lineupRenderedFromPreload) {
        return;
    }

    if (_hasPreloadedLineup()) {
        renderLineup(window.__LINEUP_PRELOADED__);
        return;
    }

    const path = window.location.pathname;
    const match = path.match(/lineup\/(\d+)/);

    if (match) {
        const match_id = match[1];

        $.ajax({
            url: match_link + "match_lineup",
            type: "get",
            data: { match_code: match_id },
            success: function (response) {
                renderLineup(response);
            }
        });
    }

});

$(document).on('click', '.lineup_tab', function(e){
    if(detail_match){
        e.preventDefault();
        let title_=$(this).attr('title');
        let link_=$(this).attr('link');
        document.title=title_;
        window.history.pushState({},"", link_);
    }
    $('#rank_pos').hide();
    $.ajax({
        url: match_link+"match_lineup",
        type: "get",
        data: {
            match_code,
        },
        success: function (response) {

            renderLineup(response);

        },
    });
});


function renderLineup(response){
    var home_team=response.info['home_team'],away_team=response.info['away_team'],lht=$('#lineup_home_team'),lat=$('#lineup_away_team'),team_a=$('.team-A'),team_b=$('.team-B')
        ,match_status=response.info['match_status'] ,coach_home=response.info['home_coach'],coach_away=response.info['away_coach'],type_formation=response.info['type_formation'];
    lht.removeClass('active');
    lat.removeClass('active');
    team_a.show();
    team_b.hide();
    team_b.removeClass('active');
    if(home_team && away_team){
        lht.addClass('active');
        team_a.addClass('active');
    }else if(home_team && away_team==null){
        lht.addClass('active');
        team_a.addClass('active');
        lat.prop( "disabled", true );
    }else if(away_team && home_team==null){
        lat.addClass('active');
        team_b.addClass('active');
        team_a.hide();
        team_b.show();
        lht.prop( "disabled", true );
    }else if(away_team==null && home_team==null){
        lat.prop( "disabled", true );
        lht.prop( "disabled", true );
    }

    if(response.info['home_formation']){
        var home_formation=response.info['home_formation'];
        $('#lineup_formation_home').html(response.info['home_formation']);
    }
    if(response.info['away_formation']){
        var away_formation=response.info['away_formation'];
        $('#lineup_formation_away').html(response.info['away_formation']);
    }

    if(coach_home){
        if(response.info['home_coach']['image']) {
            $("#coach_home_img").attr("src", response.info['home_coach']['image']);
        }
        if(response.info['home_coach']['title']) {
            $('#coach_home_title').html(response.info['home_coach']['title']);
        }

        if(response.info['home_coach']['link']) {
            $('#coach_home_link').attr('href', response.info['home_coach']['link']);
        }
    }

    if(coach_away){
        if(response.info['away_coach']['image']) {
            $("#coach_away_img").attr("src", response.info['away_coach']['image']);
        }
        if(response.info['away_coach']['title']) {
            $('#coach_away_title').html(response.info['away_coach']['title']);
        }
        if(response.info['away_coach']['link']){
            $('#coach_away_link').attr('href',response.info['away_coach']['link']);
        }
    }

    if (type_formation === 1) {
        $('.lineup-wrap, #home_sub_h_name, #home_sub_a_name, #miss_players_h_name, #miss_players_a_name').hide();
        $('#formation_list_players-A, #formation_list_players-B, #sub_players_h, #sub_players_a').empty();

        if (home_team && away_team) {
            $('#lineup_formation_list-A, #lineup_formation_list-B').show();
        } else if (home_team && !away_team) {
            $('#lineup_formation_list-A').show();
        } else if (away_team && !home_team) {
            $('#lineup_formation_list-B').show();
        } else {
            $('#lineup_formation_list-A, #lineup_formation_list-B').hide();
        }

        const renderFormationPlayers = (teamKey, containerSelector) => {
            const players = response.lineup?.[teamKey];
            if (players) {
                $(containerSelector).show();
                $.each(players, (_, value) => {
                    const player = value.player;
                    $(containerSelector).append(`
                    <div class="inline-player-item absent">
                        <a target="_blank" href="${player.link}" class="player">
                            <div class="img"><img src="${player.image}" /></div>
                            <div class="text"><h5>${player.title}</h5></div>
                        </a>
                    </div>
                `);
                });
            }
        };

        renderFormationPlayers(home_team, '#formation_list_players-A');
        renderFormationPlayers(away_team, '#formation_list_players-B');

        const renderSubs = (teamKey, containerSelector, titleSelector) => {
            const subs = response.substitutions?.[teamKey];
            if (subs) {
                $(titleSelector).show();
                $.each(subs, (_, value) => {
                    const player = value.player;
                    $(containerSelector).append(`
                    <div class="col-6 col-md-4">
                        <div class="inline-player-item">
                            <a target="_blank" href="${player.link}" class="player">
                                <div class="img"><img src="${player.image}"><span class="number">${player.player_number}</span></div>
                                <div class="text">
                                    <h5>${player.title}</h5>
                                    <span>${player.position}</span>
                                </div>
                            </a>
                        </div>
                    </div>
                `);
                });
            }
        };

        renderSubs(home_team, '#sub_players_h', '#sub_players_h_name');
        renderSubs(away_team, '#sub_players_a', '#sub_players_a_name');

    } else {
        $('.lineup-wrap').show();
        $('#lineup_formation_list-A, #lineup_formation_list-B').hide();

        // Clear any SSR-rendered fallbacks before JS re-paints the lineup.
        // `#formation_list_players-*` are populated server-side for crawlers
        // (and no-JS users); when JS runs we hand off to the pitch diagram
        // and re-render subs/missed below.
        $('#home_sub_h, #home_sub_a, #miss_players_h, #miss_players_a, #sub_players_h, #sub_players_a, #formation_list_players-A, #formation_list_players-B').empty();
        $('#sub_players_a_name, #home_sub_a_name, #miss_players_a_name, #sub_players_h_name, #home_sub_h_name, #miss_players_h_name').hide();

        let  player_performance="";
        if (type_formation === 0 && [1, 2, 3, 4, 5, 6, 7, 8, 9].includes(match_status)) {
            player_performance="player_performance";
        }


        if(response.lineup[home_team]){

            const str=home_formation,home_d=$('#home_D'),home_m=$('#home_M'),home_f=$('#home_F'),home_s=$('#home_S'),home_g=$('#home_G'),
                D="D",
                M="M",
                F="F",
                S="S",
                G="G",
                numberD =str.split('-')[0],
                numberM =str.split('-')[1],
                numberF =str.split('-')[2],
                numberS =str.split('-')[3];
            home_d.empty();
            home_m.empty();
            home_f.empty();
            home_s.empty();
            home_g.empty();

            var rating_h_g='';
            var red_h_g='';
            var yellow_h_g='';
            var goal_h_g='';
            var xgoal_h_g='';
            var change_h_g='';
            var star_h_g='';
            var assist_h_g='';
            var captain_h_g='';
            if(response.lineup[home_team][G][1]['rating'] !=null){
                const type_color=rating_c(response.lineup[home_team][G][1]['rating']);
                rating_h_g= '<span class="'+type_color+'">'+response.lineup[home_team][G][1]['rating']+'</span>';
            }
            if(response.lineup[home_team][G][1]['yellow'] !=null){
                yellow_h_g= '<div class="yellow-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#ffda46" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
            }
            if(response.lineup[home_team][G][1]['red'] !=null){
                red_h_g= '<div class="red-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#fc4d4d" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
            }
            if(response.lineup[home_team][G][1]['goal'] !=null){
                goal_h_g= '<div class="goals"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#5bd286"></path></svg>' +
                    '<i>'+response.lineup[home_team][G][1]['goal']+'</i></div>' ;
            }
            if(response.lineup[home_team][G][1]['own_goal'] !=null){
                xgoal_h_g= '<div class="x-goals"><i>'+response.lineup[home_team][G][1]['own_goal']+'</i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                    ' <path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#fc4d4d"></path></svg></div>' ;
            }
            if(response.lineup[home_team][G][1]['substitute'] !=null){
                change_h_g='<div class="change"><svg xmlns="http://www.w3.org/2000/svg" width="10.284" height="10.019" viewBox="0 0 10.284 10.019"><path id="next_1_" data-name="next (1)" d="M-1.971,29.6a.613.613,0,0,0-.866,0,.613.613,0,0,0,0,.866l.852.852h-7.43A.584.584,0,0,0-10,31.9a.584.584,0,0,0,.584.584h7.43l-.852.852a.613.613,0,0,0,0,.866.613.613,0,0,0,.866,0l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10 -29.417)" fill="#fc4d4d"></path>\n' +
                    '<path id="next_1_2" data-name="next (1)" d="M8.029.179a.613.613,0,0,0-.866.866l.852.852H.584a.584.584,0,0,0,0,1.169h7.43l-.852.852a.613.613,0,0,0,.866.866l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10.284 10.019) rotate(180)" fill="#5bd286"></path></svg></div>';
            }
            if(response.lineup[home_team][G][1]['captain'] ===1){
                captain_h_g="number_cap";
            }else{
                captain_h_g="number";
            }
            if(response.lineup[home_team][G][1]['man_match'] !=null){
                star_h_g='<div class="star"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path></svg></div>';
            }
            if(response.lineup[home_team][G][1]['assist'] !=null){
                assist_h_g='<div class="assist"><svg xmlns="http://www.w3.org/2000/svg" width="11.192" height="5.134" viewBox="0 0 11.192 5.134"><path id="Path_54488" data-name="Path 54488" d="M69,27.416l.011.021c-.047.031-.073.093-.109.137a1.606,1.606,0,0,1-.229.231,1.916,1.916,0,0,1-1.245.423,2.774,2.774,0,0,1-.971-.193,1.456,1.456,0,0,0-.929-.241,1.184,1.184,0,0,0-.454.318v.011l.074.074c.034.183.315.294.333.485a.145.145,0,0,1-.228.118.716.716,0,0,1-.119-.137,3.523,3.523,0,0,1-.282-.361l-.306.166-.718.373a1.765,1.765,0,0,0,.18.336.434.434,0,0,1,.1.234.142.142,0,0,1-.25.08.773.773,0,0,1-.11-.185,2.173,2.173,0,0,1-.187-.338,7.707,7.707,0,0,0-.834.313c-.261.1-.534.16-.8.236a2.183,2.183,0,0,1-.58.158,1.418,1.418,0,0,1-.506.132,6.951,6.951,0,0,0-.76.223,1.289,1.289,0,0,0-.378.182.9.9,0,0,0-.245.794c0,.111-.027.248.057.335a.334.334,0,0,0,.165.066,2.317,2.317,0,0,0,.412.105l.063.338c.058.075.024.2.1.269a.213.213,0,0,0,.155.048c.135,0,.372.045.484-.041.055-.042.046-.11.086-.16l.053-.285.749.084.032.19c.048.059.034.132.106.18a.382.382,0,0,0,.222.031.757.757,0,0,0,.485-.084l.011-.032.042-.243,2.575-.032,1.963-.084a.831.831,0,0,0,.118.419c.113.109.38.056.525.056a.236.236,0,0,0,.168-.047c.115-.1.052-.3.138-.406l-.011-.042a2.984,2.984,0,0,1,.338-.02.253.253,0,0,1,.134.01c.036.024.037.088.045.126a.849.849,0,0,0,.092.306c.091.129.362.074.5.074a.313.313,0,0,0,.169-.024c.077-.046.068-.115.116-.176,0-.067.032-.3.089-.337.04-.027.117-.008.164-.011a.714.714,0,0,0,.433-.1l-.011-.032c.035-.029.039-.094.048-.137a1,1,0,0,1,.1-.369l.011-.042.08-.38.047-.158a2.387,2.387,0,0,1,.092-.538,4.543,4.543,0,0,0,.035-.981c-.119.084-.222.191-.339.279a7.268,7.268,0,0,1-.854.542c-.581.323-1.226.5-1.825.788a3.1,3.1,0,0,0-.674.415c-.08.067-.164.221-.256.26a1.365,1.365,0,0,1-.389.028c-.315.026-.632.059-.95.073a1.281,1.281,0,0,1,.326-.308,3.452,3.452,0,0,1,.74-.428,8.054,8.054,0,0,1,.938-.284A12.859,12.859,0,0,0,69.34,29.5a5.549,5.549,0,0,0,.96-.566c.089-.068.269-.172.3-.286.025-.093-.076-.2-.088-.3a1.871,1.871,0,0,0-.34.238,3.855,3.855,0,0,1-.442.274,14.181,14.181,0,0,1-1.6.684,5.433,5.433,0,0,1-.674.189c-.07.018-.218.026-.264.083a.512.512,0,0,0-.19.042c-.141.038-.281.084-.422.122a5.149,5.149,0,0,0-1.794.782,2.452,2.452,0,0,0-.356.32c-.058.066-.124.189-.2.228a.481.481,0,0,1-.189.015c-.081,0-.16.02-.243.021-.26,0-.52.021-.781.021a1.7,1.7,0,0,1,.485-.529,4.991,4.991,0,0,1,1.614-.877c.4-.136.822-.184,1.234-.281a13.847,13.847,0,0,0,2.872-.86,5.15,5.15,0,0,0,1.192-.713,4.178,4.178,0,0,0-.647-.87c-.1-.1-.261-.231-.416-.191-.2.051-.211.245-.341.365m-3.335.116a1.719,1.719,0,0,1,.844.25,2.269,2.269,0,0,0,.844.183,1.414,1.414,0,0,0-.229-.274c-.185-.213-.4-.587-.71-.6a.891.891,0,0,0-.539.268A1.44,1.44,0,0,0,65.667,27.532Z" transform="translate(-59.458 -27.044)" fill="#fff"></path><svg></div>';
            }
            home_g.append('<div class="col-12 d-inline-flex justify-content-center">\n' +
                '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[home_team][G][1]['player']['row_id'] + '">\n' +
                '                                                <a target="_blank" href="' + response.lineup[home_team][G][1]['player']['link'] + '" class="image-wrapper">\n' +
                '                                                    <div class="img"><img src="' + response.lineup[home_team][G][1]['player']['image'] + '"></div>\n' +
                '                                                    <span class="'+captain_h_g+'">' + response.lineup[home_team][G][1]['player']['player_number'] + '</span>\n' +
                '                                                    ' +rating_h_g+ yellow_h_g + red_h_g + goal_h_g + xgoal_h_g + change_h_g + star_h_g + assist_h_g +
                '                                                </a>\n' +
                '                                                <div class="player-name">\n' +
                '                                                    <h3>' + response.lineup[home_team][G][1]['player']['title'] + '</h3>\n' +
                '                                                </div>\n' +
                '                                           </div> ' +
                '                                        </div>');
//
            for (let i = 1; i <= numberD; i++) {
                var rating_h_d='';
                var red_h_d='';
                var yellow_h_d='';
                var goal_h_d='';
                var xgoal_h_d='';
                var change_h_d='';
                var star_h_d='';
                var assist_h_d='';
                var captain_h_d='';
                if(response.lineup[home_team][D][i]['rating'] !=null){
                    const type_color=rating_c(response.lineup[home_team][D][i]['rating']);
                    rating_h_d= '<span class="'+type_color+'">'+response.lineup[home_team][D][i]['rating']+'</span>';
                }
                if(response.lineup[home_team][D][i]['yellow'] !=null){
                    yellow_h_d= '<div class="yellow-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#ffda46" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[home_team][D][i]['red'] !=null){
                    red_h_d= '<div class="red-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#fc4d4d" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[home_team][D][i]['goal'] !=null){
                    goal_h_d= '<div class="goals"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#5bd286"></path></svg>' +
                        '<i>'+response.lineup[home_team][D][i]['goal']+'</i></div>' ;
                }
                if(response.lineup[home_team][D][i]['own_goal'] !=null){
                    xgoal_h_d= '<div class="x-goals"><i>'+response.lineup[home_team][D][i]['own_goal']+'</i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                        ' <path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#fc4d4d"></path></svg></div>' ;
                }
                if(response.lineup[home_team][D][i]['substitute'] !=null){
                    change_h_d='<div class="change"><svg xmlns="http://www.w3.org/2000/svg" width="10.284" height="10.019" viewBox="0 0 10.284 10.019"><path id="next_1_" data-name="next (1)" d="M-1.971,29.6a.613.613,0,0,0-.866,0,.613.613,0,0,0,0,.866l.852.852h-7.43A.584.584,0,0,0-10,31.9a.584.584,0,0,0,.584.584h7.43l-.852.852a.613.613,0,0,0,0,.866.613.613,0,0,0,.866,0l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10 -29.417)" fill="#fc4d4d"></path>\n' +
                        '<path id="next_1_2" data-name="next (1)" d="M8.029.179a.613.613,0,0,0-.866.866l.852.852H.584a.584.584,0,0,0,0,1.169h7.43l-.852.852a.613.613,0,0,0,.866.866l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10.284 10.019) rotate(180)" fill="#5bd286"></path></svg></div>';
                }
                if(response.lineup[home_team][D][i]['man_match'] !=null){
                    star_h_d='<div class="star"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path></svg></div>';
                }
                if(response.lineup[home_team][D][i]['assist'] !=null){
                    const assist=response.lineup[home_team][D][i]['assist'];
                    assist_h_d = `
        <div class="assist">
      <svg xmlns="http://www.w3.org/2000/svg" width="11.192" height="5.134" viewBox="0 0 11.192 5.134"><path id="Path_54488" data-name="Path 54488" d="M69,27.416l.011.021c-.047.031-.073.093-.109.137a1.606,1.606,0,0,1-.229.231,1.916,1.916,0,0,1-1.245.423,2.774,2.774,0,0,1-.971-.193,1.456,1.456,0,0,0-.929-.241,1.184,1.184,0,0,0-.454.318v.011l.074.074c.034.183.315.294.333.485a.145.145,0,0,1-.228.118.716.716,0,0,1-.119-.137,3.523,3.523,0,0,1-.282-.361l-.306.166-.718.373a1.765,1.765,0,0,0,.18.336.434.434,0,0,1,.1.234.142.142,0,0,1-.25.08.773.773,0,0,1-.11-.185,2.173,2.173,0,0,1-.187-.338,7.707,7.707,0,0,0-.834.313c-.261.1-.534.16-.8.236a2.183,2.183,0,0,1-.58.158,1.418,1.418,0,0,1-.506.132,6.951,6.951,0,0,0-.76.223,1.289,1.289,0,0,0-.378.182.9.9,0,0,0-.245.794c0,.111-.027.248.057.335a.334.334,0,0,0,.165.066,2.317,2.317,0,0,0,.412.105l.063.338c.058.075.024.2.1.269a.213.213,0,0,0,.155.048c.135,0,.372.045.484-.041.055-.042.046-.11.086-.16l.053-.285.749.084.032.19c.048.059.034.132.106.18a.382.382,0,0,0,.222.031.757.757,0,0,0,.485-.084l.011-.032.042-.243,2.575-.032,1.963-.084a.831.831,0,0,0,.118.419c.113.109.38.056.525.056a.236.236,0,0,0,.168-.047c.115-.1.052-.3.138-.406l-.011-.042a2.984,2.984,0,0,1,.338-.02.253.253,0,0,1,.134.01c.036.024.037.088.045.126a.849.849,0,0,0,.092.306c.091.129.362.074.5.074a.313.313,0,0,0,.169-.024c.077-.046.068-.115.116-.176,0-.067.032-.3.089-.337.04-.027.117-.008.164-.011a.714.714,0,0,0,.433-.1l-.011-.032c.035-.029.039-.094.048-.137a1,1,0,0,1,.1-.369l.011-.042.08-.38.047-.158a2.387,2.387,0,0,1,.092-.538,4.543,4.543,0,0,0,.035-.981c-.119.084-.222.191-.339.279a7.268,7.268,0,0,1-.854.542c-.581.323-1.226.5-1.825.788a3.1,3.1,0,0,0-.674.415c-.08.067-.164.221-.256.26a1.365,1.365,0,0,1-.389.028c-.315.026-.632.059-.95.073a1.281,1.281,0,0,1,.326-.308,3.452,3.452,0,0,1,.74-.428,8.054,8.054,0,0,1,.938-.284A12.859,12.859,0,0,0,69.34,29.5a5.549,5.549,0,0,0,.96-.566c.089-.068.269-.172.3-.286.025-.093-.076-.2-.088-.3a1.871,1.871,0,0,0-.34.238,3.855,3.855,0,0,1-.442.274,14.181,14.181,0,0,1-1.6.684,5.433,5.433,0,0,1-.674.189c-.07.018-.218.026-.264.083a.512.512,0,0,0-.19.042c-.141.038-.281.084-.422.122a5.149,5.149,0,0,0-1.794.782,2.452,2.452,0,0,0-.356.32c-.058.066-.124.189-.2.228a.481.481,0,0,1-.189.015c-.081,0-.16.02-.243.021-.26,0-.52.021-.781.021a1.7,1.7,0,0,1,.485-.529,4.991,4.991,0,0,1,1.614-.877c.4-.136.822-.184,1.234-.281a13.847,13.847,0,0,0,2.872-.86,5.15,5.15,0,0,0,1.192-.713,4.178,4.178,0,0,0-.647-.87c-.1-.1-.261-.231-.416-.191-.2.051-.211.245-.341.365m-3.335.116a1.719,1.719,0,0,1,.844.25,2.269,2.269,0,0,0,.844.183,1.414,1.414,0,0,0-.229-.274c-.185-.213-.4-.587-.71-.6a.891.891,0,0,0-.539.268A1.44,1.44,0,0,0,65.667,27.532Z" transform="translate(-59.458 -27.044)" fill="#fff"></path><svg>
            ${assist > 1 ? `<i>${assist}</i>` : ``}
        </div>
    `;
                }
                if(response.lineup[home_team][D][i]['captain'] ===1){
                    captain_h_d="number_cap";
                }else{
                    captain_h_d="number";
                }
                if (numberD === '1' || numberD === '2' || numberD === '3' || numberD === '4') {
                    home_d.append('<div class="col-3 d-inline-flex justify-content-center">' +
                        '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[home_team][D][i]['player']['row_id'] + '">\n' +
                        '                                                <a target="_blank" href="' + response.lineup[home_team][D][i]['player']['link'] + '" class="image-wrapper">\n' +
                        '                                                    <div class="img"><img src="' + response.lineup[home_team][D][i]['player']['image'] + '"></div>\n' +
                        '                                                    <span class="'+captain_h_d+'">' + response.lineup[home_team][D][i]['player']['player_number'] + '</span>\n' +
                        '                                                    ' +rating_h_d+ yellow_h_d + red_h_d + goal_h_d + xgoal_h_d + change_h_d + star_h_d + assist_h_d +
                        '                                                </a>\n' +
                        '                                                <div class="player-name">\n' +
                        '                                                    <h3>' + response.lineup[home_team][D][i]['player']['title'] + '</h3>\n' +
                        '                                                </div>\n' +
                        '                                           </div> ' +
                        '                                             </div>');

                }
                if (numberD === '5') {
                    home_d.append('<div class="col-2-5 d-inline-flex justify-content-center pdh' + i + '">' +
                        '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[home_team][D][i]['player']['row_id'] + '">\n' +
                        '                                                <a target="_blank" href="' + response.lineup[home_team][D][i]['player']['link'] + '" class="image-wrapper">\n' +
                        '                                                    <div class="img"><img src="' + response.lineup[home_team][D][i]['player']['image'] + '"></div>\n' +
                        '                                                    <span class="'+captain_h_d+'">' + response.lineup[home_team][D][i]['player']['player_number'] + '</span>\n' +
                        '                                                    ' +rating_h_d+ yellow_h_d + red_h_d + goal_h_d + xgoal_h_d + change_h_d + star_h_d + assist_h_d +
                        '                                                </a>\n' +
                        '                                                <div class="player-name">\n' +
                        '                                                    <h3>' + response.lineup[home_team][D][i]['player']['title'] + '</h3>\n' +
                        '                                                </div>\n' +
                        '                                           </div> ' +
                        '                                             </div>');



                    if (i === 1) {
                        $('.pdh' + i).css('margin-top', '-5%');
                    } else if (i === 5) {
                        $('.pdh' + i).css('margin-top', '-5%');
                    }

                }

            }
            for (let i = 1; i <= numberM; i++) {
                var rating_h_m='';
                var red_h_m='';
                var yellow_h_m='';
                var goal_h_m='';
                var xgoal_h_m='';
                var change_h_m='';
                var star_h_m='';
                var assist_h_m='';
                var captain_h_m='';
                if(response.lineup[home_team][M][i]['captain'] ===1){
                    captain_h_m="number_cap";
                }else{
                    captain_h_m="number";
                }
                if(response.lineup[home_team][M][i]['rating'] !=null){
                    const type_color=rating_c(response.lineup[home_team][M][i]['rating']);
                    rating_h_m= '<span class="'+type_color+'">'+response.lineup[home_team][M][i]['rating']+'</span>';
                }
                if(response.lineup[home_team][M][i]['yellow'] !=null){
                    yellow_h_m= '<div class="yellow-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#ffda46" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[home_team][M][i]['red'] !=null){
                    red_h_m= '<div class="red-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#fc4d4d" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[home_team][M][i]['goal'] !=null){
                    goal_h_m= '<div class="goals"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#5bd286"></path></svg>' +
                        '<i>'+response.lineup[home_team][M][i]['goal']+'</i></div>' ;
                }
                if(response.lineup[home_team][M][i]['own_goal'] !=null){
                    xgoal_h_m= '<div class="x-goals"><i>'+response.lineup[home_team][M][i]['own_goal']+'</i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                        ' <path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#fc4d4d"></path></svg></div>' ;
                }
                if(response.lineup[home_team][M][i]['substitute'] !=null){
                    change_h_m='<div class="change"><svg xmlns="http://www.w3.org/2000/svg" width="10.284" height="10.019" viewBox="0 0 10.284 10.019"><path id="next_1_" data-name="next (1)" d="M-1.971,29.6a.613.613,0,0,0-.866,0,.613.613,0,0,0,0,.866l.852.852h-7.43A.584.584,0,0,0-10,31.9a.584.584,0,0,0,.584.584h7.43l-.852.852a.613.613,0,0,0,0,.866.613.613,0,0,0,.866,0l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10 -29.417)" fill="#fc4d4d"></path>\n' +
                        '<path id="next_1_2" data-name="next (1)" d="M8.029.179a.613.613,0,0,0-.866.866l.852.852H.584a.584.584,0,0,0,0,1.169h7.43l-.852.852a.613.613,0,0,0,.866.866l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10.284 10.019) rotate(180)" fill="#5bd286"></path></svg></div>';
                }
                if(response.lineup[home_team][M][i]['man_match'] !=null){
                    star_h_m='<div class="star"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path></svg></div>';
                }

                if(response.lineup[home_team][M][i]['assist'] !=null){
                    const assist=response.lineup[home_team][M][i]['assist'];
                    assist_h_m = `
        <div class="assist">
      <svg xmlns="http://www.w3.org/2000/svg" width="11.192" height="5.134" viewBox="0 0 11.192 5.134"><path id="Path_54488" data-name="Path 54488" d="M69,27.416l.011.021c-.047.031-.073.093-.109.137a1.606,1.606,0,0,1-.229.231,1.916,1.916,0,0,1-1.245.423,2.774,2.774,0,0,1-.971-.193,1.456,1.456,0,0,0-.929-.241,1.184,1.184,0,0,0-.454.318v.011l.074.074c.034.183.315.294.333.485a.145.145,0,0,1-.228.118.716.716,0,0,1-.119-.137,3.523,3.523,0,0,1-.282-.361l-.306.166-.718.373a1.765,1.765,0,0,0,.18.336.434.434,0,0,1,.1.234.142.142,0,0,1-.25.08.773.773,0,0,1-.11-.185,2.173,2.173,0,0,1-.187-.338,7.707,7.707,0,0,0-.834.313c-.261.1-.534.16-.8.236a2.183,2.183,0,0,1-.58.158,1.418,1.418,0,0,1-.506.132,6.951,6.951,0,0,0-.76.223,1.289,1.289,0,0,0-.378.182.9.9,0,0,0-.245.794c0,.111-.027.248.057.335a.334.334,0,0,0,.165.066,2.317,2.317,0,0,0,.412.105l.063.338c.058.075.024.2.1.269a.213.213,0,0,0,.155.048c.135,0,.372.045.484-.041.055-.042.046-.11.086-.16l.053-.285.749.084.032.19c.048.059.034.132.106.18a.382.382,0,0,0,.222.031.757.757,0,0,0,.485-.084l.011-.032.042-.243,2.575-.032,1.963-.084a.831.831,0,0,0,.118.419c.113.109.38.056.525.056a.236.236,0,0,0,.168-.047c.115-.1.052-.3.138-.406l-.011-.042a2.984,2.984,0,0,1,.338-.02.253.253,0,0,1,.134.01c.036.024.037.088.045.126a.849.849,0,0,0,.092.306c.091.129.362.074.5.074a.313.313,0,0,0,.169-.024c.077-.046.068-.115.116-.176,0-.067.032-.3.089-.337.04-.027.117-.008.164-.011a.714.714,0,0,0,.433-.1l-.011-.032c.035-.029.039-.094.048-.137a1,1,0,0,1,.1-.369l.011-.042.08-.38.047-.158a2.387,2.387,0,0,1,.092-.538,4.543,4.543,0,0,0,.035-.981c-.119.084-.222.191-.339.279a7.268,7.268,0,0,1-.854.542c-.581.323-1.226.5-1.825.788a3.1,3.1,0,0,0-.674.415c-.08.067-.164.221-.256.26a1.365,1.365,0,0,1-.389.028c-.315.026-.632.059-.95.073a1.281,1.281,0,0,1,.326-.308,3.452,3.452,0,0,1,.74-.428,8.054,8.054,0,0,1,.938-.284A12.859,12.859,0,0,0,69.34,29.5a5.549,5.549,0,0,0,.96-.566c.089-.068.269-.172.3-.286.025-.093-.076-.2-.088-.3a1.871,1.871,0,0,0-.34.238,3.855,3.855,0,0,1-.442.274,14.181,14.181,0,0,1-1.6.684,5.433,5.433,0,0,1-.674.189c-.07.018-.218.026-.264.083a.512.512,0,0,0-.19.042c-.141.038-.281.084-.422.122a5.149,5.149,0,0,0-1.794.782,2.452,2.452,0,0,0-.356.32c-.058.066-.124.189-.2.228a.481.481,0,0,1-.189.015c-.081,0-.16.02-.243.021-.26,0-.52.021-.781.021a1.7,1.7,0,0,1,.485-.529,4.991,4.991,0,0,1,1.614-.877c.4-.136.822-.184,1.234-.281a13.847,13.847,0,0,0,2.872-.86,5.15,5.15,0,0,0,1.192-.713,4.178,4.178,0,0,0-.647-.87c-.1-.1-.261-.231-.416-.191-.2.051-.211.245-.341.365m-3.335.116a1.719,1.719,0,0,1,.844.25,2.269,2.269,0,0,0,.844.183,1.414,1.414,0,0,0-.229-.274c-.185-.213-.4-.587-.71-.6a.891.891,0,0,0-.539.268A1.44,1.44,0,0,0,65.667,27.532Z" transform="translate(-59.458 -27.044)" fill="#fff"></path><svg>
            ${assist > 1 ? `<i>${assist}</i>` : ``}
        </div>
    `;
                }

                if (numberM === '1' || numberM === '2' || numberM === '3' || numberM === '4') {

                    home_m.append(' <div class="col-3 d-inline-flex justify-content-center pmh' + i + '">\n' +
                        '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[home_team][M][i]['player']['row_id'] + '">\n' +
                        '                                                <a target="_blank" href="' + response.lineup[home_team][M][i]['player']['link'] + '" class="image-wrapper">\n' +
                        '                                                    <div class="img"><img src="' + response.lineup[home_team][M][i]['player']['image'] + '"></div>\n' +
                        '                                                    <span class="'+captain_h_m+'">' + response.lineup[home_team][M][i]['player']['player_number'] + '</span>\n' +
                        '                                                    ' +rating_h_m+ yellow_h_m + red_h_m + goal_h_m + xgoal_h_m + change_h_m + star_h_m + assist_h_m +
                        '                                                </a>\n' +
                        '                                                <div class="player-name">\n' +
                        '                                                    <h3>' + response.lineup[home_team][M][i]['player']['title'] + '</h3>\n' +
                        '                                                </div>\n' +
                        '                                           </div> ' +
                        '                                        </div>');

                }
                if (numberM === '5') {
                    home_m.append('<div class="col-2-5 d-inline-flex justify-content-center pmh' + i + '">\n' +
                        '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[home_team][M][i]['player']['row_id'] + '">\n' +
                        '                                                <a target="_blank" href="' + response.lineup[home_team][M][i]['player']['link'] + '" class="image-wrapper">\n' +
                        '                                                    <div class="img"><img src="' + response.lineup[home_team][M][i]['player']['image'] + '"></div>\n' +
                        '                                                    <span class="'+captain_h_m+'">' + response.lineup[home_team][M][i]['player']['player_number'] + '</span>\n' +
                        '                                                    ' +rating_h_m+ yellow_h_m + red_h_m + goal_h_m + xgoal_h_m + change_h_m + star_h_m + assist_h_m +
                        '                                                </a>\n' +
                        '                                                <div class="player-name">\n' +
                        '                                                    <h3>' + response.lineup[home_team][M][i]['player']['title'] + '</h3>\n' +
                        '                                                </div>\n' +
                        '                                           </div> ' +
                        '                                        </div>');

                    if (i === 1) {
                        $('.pmh' + i).css('margin-top', '-5%');
                    } else if (i === 5) {
                        $('.pmh' + i).css('margin-top', '-5%');
                    }

                }
                if (numberM === '3') {
                    if (i === 1) {
                        if (numberS === undefined) {
                            $('.pmh' + i).css('margin-top', '-8%');
                        }
                    }else if (i === 3) {
                        if (numberS === undefined) {
                            $('.pmh' + i).css('margin-top', '-8%');
                        }
                    }
                }

                if (numberM === '4') {
                    if (i === 1) {
                        if (numberS === undefined) {
                            $('.pmh' + i).css('margin-top', '-8%');
                        }
                    }else if (i === 4) {
                        if (numberS === undefined) {
                            $('.pmh' + i).css('margin-top', '-8%');
                        }
                    }
                }

            }


            for (let i = 1; i <= numberF; i++) {
                var rating_h_f='';
                var red_h_f='';
                var yellow_h_f='';
                var goal_h_f='';
                var xgoal_h_f='';
                var change_h_f='';
                var star_h_f='';
                var assist_h_f='';
                var captain_h_f='';
                if(response.lineup[home_team][F][i]['captain'] ===1){
                    captain_h_f="number_cap";
                }else{
                    captain_h_f="number";
                }
                if(response.lineup[home_team][F][i]['rating'] !=null){
                    const type_color=rating_c(response.lineup[home_team][F][i]['rating']);
                    rating_h_f= '<span class="'+type_color+'">'+response.lineup[home_team][F][i]['rating']+'</span>';
                }
                if(response.lineup[home_team][F][i]['yellow'] !=null){
                    yellow_h_f= '<div class="yellow-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#ffda46" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[home_team][F][i]['red'] !=null){
                    red_h_f= '<div class="red-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#fc4d4d" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[home_team][F][i]['goal'] !=null){
                    goal_h_f= '<div class="goals"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#5bd286"></path></svg>' +
                        '<i>'+response.lineup[home_team][F][i]['goal']+'</i></div>' ;
                }
                if(response.lineup[home_team][F][i]['own_goal'] !=null){
                    xgoal_h_f= '<div class="x-goals"><i>'+response.lineup[home_team][F][i]['own_goal']+'</i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                        ' <path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#fc4d4d"></path></svg></div>' ;
                }
                if(response.lineup[home_team][F][i]['substitute'] !=null){
                    change_h_f='<div class="change"><svg xmlns="http://www.w3.org/2000/svg" width="10.284" height="10.019" viewBox="0 0 10.284 10.019"><path id="next_1_" data-name="next (1)" d="M-1.971,29.6a.613.613,0,0,0-.866,0,.613.613,0,0,0,0,.866l.852.852h-7.43A.584.584,0,0,0-10,31.9a.584.584,0,0,0,.584.584h7.43l-.852.852a.613.613,0,0,0,0,.866.613.613,0,0,0,.866,0l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10 -29.417)" fill="#fc4d4d"></path>\n' +
                        '<path id="next_1_2" data-name="next (1)" d="M8.029.179a.613.613,0,0,0-.866.866l.852.852H.584a.584.584,0,0,0,0,1.169h7.43l-.852.852a.613.613,0,0,0,.866.866l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10.284 10.019) rotate(180)" fill="#5bd286"></path></svg></div>';
                }
                if(response.lineup[home_team][F][i]['man_match'] !=null){
                    star_h_f='<div class="star"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path></svg></div>';
                }
                if(response.lineup[home_team][F][i]['assist'] !=null){
                    const assist=response.lineup[home_team][F][i]['assist'];
                    assist_h_f = `
        <div class="assist">
      <svg xmlns="http://www.w3.org/2000/svg" width="11.192" height="5.134" viewBox="0 0 11.192 5.134"><path id="Path_54488" data-name="Path 54488" d="M69,27.416l.011.021c-.047.031-.073.093-.109.137a1.606,1.606,0,0,1-.229.231,1.916,1.916,0,0,1-1.245.423,2.774,2.774,0,0,1-.971-.193,1.456,1.456,0,0,0-.929-.241,1.184,1.184,0,0,0-.454.318v.011l.074.074c.034.183.315.294.333.485a.145.145,0,0,1-.228.118.716.716,0,0,1-.119-.137,3.523,3.523,0,0,1-.282-.361l-.306.166-.718.373a1.765,1.765,0,0,0,.18.336.434.434,0,0,1,.1.234.142.142,0,0,1-.25.08.773.773,0,0,1-.11-.185,2.173,2.173,0,0,1-.187-.338,7.707,7.707,0,0,0-.834.313c-.261.1-.534.16-.8.236a2.183,2.183,0,0,1-.58.158,1.418,1.418,0,0,1-.506.132,6.951,6.951,0,0,0-.76.223,1.289,1.289,0,0,0-.378.182.9.9,0,0,0-.245.794c0,.111-.027.248.057.335a.334.334,0,0,0,.165.066,2.317,2.317,0,0,0,.412.105l.063.338c.058.075.024.2.1.269a.213.213,0,0,0,.155.048c.135,0,.372.045.484-.041.055-.042.046-.11.086-.16l.053-.285.749.084.032.19c.048.059.034.132.106.18a.382.382,0,0,0,.222.031.757.757,0,0,0,.485-.084l.011-.032.042-.243,2.575-.032,1.963-.084a.831.831,0,0,0,.118.419c.113.109.38.056.525.056a.236.236,0,0,0,.168-.047c.115-.1.052-.3.138-.406l-.011-.042a2.984,2.984,0,0,1,.338-.02.253.253,0,0,1,.134.01c.036.024.037.088.045.126a.849.849,0,0,0,.092.306c.091.129.362.074.5.074a.313.313,0,0,0,.169-.024c.077-.046.068-.115.116-.176,0-.067.032-.3.089-.337.04-.027.117-.008.164-.011a.714.714,0,0,0,.433-.1l-.011-.032c.035-.029.039-.094.048-.137a1,1,0,0,1,.1-.369l.011-.042.08-.38.047-.158a2.387,2.387,0,0,1,.092-.538,4.543,4.543,0,0,0,.035-.981c-.119.084-.222.191-.339.279a7.268,7.268,0,0,1-.854.542c-.581.323-1.226.5-1.825.788a3.1,3.1,0,0,0-.674.415c-.08.067-.164.221-.256.26a1.365,1.365,0,0,1-.389.028c-.315.026-.632.059-.95.073a1.281,1.281,0,0,1,.326-.308,3.452,3.452,0,0,1,.74-.428,8.054,8.054,0,0,1,.938-.284A12.859,12.859,0,0,0,69.34,29.5a5.549,5.549,0,0,0,.96-.566c.089-.068.269-.172.3-.286.025-.093-.076-.2-.088-.3a1.871,1.871,0,0,0-.34.238,3.855,3.855,0,0,1-.442.274,14.181,14.181,0,0,1-1.6.684,5.433,5.433,0,0,1-.674.189c-.07.018-.218.026-.264.083a.512.512,0,0,0-.19.042c-.141.038-.281.084-.422.122a5.149,5.149,0,0,0-1.794.782,2.452,2.452,0,0,0-.356.32c-.058.066-.124.189-.2.228a.481.481,0,0,1-.189.015c-.081,0-.16.02-.243.021-.26,0-.52.021-.781.021a1.7,1.7,0,0,1,.485-.529,4.991,4.991,0,0,1,1.614-.877c.4-.136.822-.184,1.234-.281a13.847,13.847,0,0,0,2.872-.86,5.15,5.15,0,0,0,1.192-.713,4.178,4.178,0,0,0-.647-.87c-.1-.1-.261-.231-.416-.191-.2.051-.211.245-.341.365m-3.335.116a1.719,1.719,0,0,1,.844.25,2.269,2.269,0,0,0,.844.183,1.414,1.414,0,0,0-.229-.274c-.185-.213-.4-.587-.71-.6a.891.891,0,0,0-.539.268A1.44,1.44,0,0,0,65.667,27.532Z" transform="translate(-59.458 -27.044)" fill="#fff"></path><svg>
            ${assist > 1 ? `<i>${assist}</i>` : ``}
        </div>
    `;
                }

                home_f.append(' <div class="col-3 d-inline-flex justify-content-center">\n' +
                    '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[home_team][F][i]['player']['row_id'] + '">\n' +
                    '                                                <a target="_blank" href="' + response.lineup[home_team][F][i]['player']['link'] + '" class="image-wrapper">\n' +
                    '                                                    <div class="img"><img src="' + response.lineup[home_team][F][i]['player']['image'] + '"></div>\n' +
                    '                                                    <span class="'+captain_h_f+'">' + response.lineup[home_team][F][i]['player']['player_number'] + '</span>\n' +
                    '                                                    ' +rating_h_f+ yellow_h_f + red_h_f + goal_h_f + xgoal_h_f + change_h_f + star_h_f + assist_h_f +
                    '                                                </a>\n' +
                    '                                                <div class="player-name">\n' +
                    '                                                    <h3>' + response.lineup[home_team][F][i]['player']['title'] + '</h3>\n' +
                    '                                                </div>\n' +
                    '                                           </div> ' +
                    '                                        </div>');
                if(numberS ===undefined){
                    $('.home_f').addClass('m-t-10');
                }

            }


            for (let i = 1; i <= numberS; i++) {

                var rating_h_s='';
                var red_h_s='';
                var yellow_h_s='';
                var goal_h_s='';
                var xgoal_h_s='';
                var change_h_s='';
                var star_h_s='';
                var assist_h_s='';
                var captain_h_s='';
                if(response.lineup[home_team][S][i]['captain'] ===1){
                    captain_h_s="number_cap";
                }else{
                    captain_h_s="number";
                }
                if(response.lineup[home_team][S][i]['rating'] !=null){
                    const type_color=rating_c(response.lineup[home_team][S][i]['rating']);
                    rating_h_s= '<span class="'+type_color+'">'+response.lineup[home_team][S][i]['rating']+'</span>';
                }
                if(response.lineup[home_team][S][i]['yellow'] !=null){
                    yellow_h_s= '<div class="yellow-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#ffda46" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[home_team][S][i]['red'] !=null){
                    red_h_s= '<div class="red-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#fc4d4d" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[home_team][S][i]['goal'] !=null){
                    goal_h_s= '<div class="goals"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#5bd286"></path></svg>' +
                        '<i>'+response.lineup[home_team][S][i]['goal']+'</i></div>' ;
                }
                if(response.lineup[home_team][S][i]['own_goal'] !=null){
                    xgoal_h_s= '<div class="x-goals"><i>'+response.lineup[home_team][S][i]['own_goal']+'</i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                        ' <path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#fc4d4d"></path></svg></div>' ;
                }
                if(response.lineup[home_team][S][i]['substitute'] !=null){
                    change_h_s='<div class="change"><svg xmlns="http://www.w3.org/2000/svg" width="10.284" height="10.019" viewBox="0 0 10.284 10.019"><path id="next_1_" data-name="next (1)" d="M-1.971,29.6a.613.613,0,0,0-.866,0,.613.613,0,0,0,0,.866l.852.852h-7.43A.584.584,0,0,0-10,31.9a.584.584,0,0,0,.584.584h7.43l-.852.852a.613.613,0,0,0,0,.866.613.613,0,0,0,.866,0l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10 -29.417)" fill="#fc4d4d"></path>\n' +
                        '<path id="next_1_2" data-name="next (1)" d="M8.029.179a.613.613,0,0,0-.866.866l.852.852H.584a.584.584,0,0,0,0,1.169h7.43l-.852.852a.613.613,0,0,0,.866.866l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10.284 10.019) rotate(180)" fill="#5bd286"></path></svg></div>';
                }
                if(response.lineup[home_team][S][i]['man_match'] !=null){
                    star_h_s='<div class="star"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path></svg></div>';
                }
                if(response.lineup[home_team][S][i]['assist'] !=null){
                    const assist=response.lineup[home_team][S][i]['assist'];
                    assist_h_s = `
        <div class="assist">
      <svg xmlns="http://www.w3.org/2000/svg" width="11.192" height="5.134" viewBox="0 0 11.192 5.134"><path id="Path_54488" data-name="Path 54488" d="M69,27.416l.011.021c-.047.031-.073.093-.109.137a1.606,1.606,0,0,1-.229.231,1.916,1.916,0,0,1-1.245.423,2.774,2.774,0,0,1-.971-.193,1.456,1.456,0,0,0-.929-.241,1.184,1.184,0,0,0-.454.318v.011l.074.074c.034.183.315.294.333.485a.145.145,0,0,1-.228.118.716.716,0,0,1-.119-.137,3.523,3.523,0,0,1-.282-.361l-.306.166-.718.373a1.765,1.765,0,0,0,.18.336.434.434,0,0,1,.1.234.142.142,0,0,1-.25.08.773.773,0,0,1-.11-.185,2.173,2.173,0,0,1-.187-.338,7.707,7.707,0,0,0-.834.313c-.261.1-.534.16-.8.236a2.183,2.183,0,0,1-.58.158,1.418,1.418,0,0,1-.506.132,6.951,6.951,0,0,0-.76.223,1.289,1.289,0,0,0-.378.182.9.9,0,0,0-.245.794c0,.111-.027.248.057.335a.334.334,0,0,0,.165.066,2.317,2.317,0,0,0,.412.105l.063.338c.058.075.024.2.1.269a.213.213,0,0,0,.155.048c.135,0,.372.045.484-.041.055-.042.046-.11.086-.16l.053-.285.749.084.032.19c.048.059.034.132.106.18a.382.382,0,0,0,.222.031.757.757,0,0,0,.485-.084l.011-.032.042-.243,2.575-.032,1.963-.084a.831.831,0,0,0,.118.419c.113.109.38.056.525.056a.236.236,0,0,0,.168-.047c.115-.1.052-.3.138-.406l-.011-.042a2.984,2.984,0,0,1,.338-.02.253.253,0,0,1,.134.01c.036.024.037.088.045.126a.849.849,0,0,0,.092.306c.091.129.362.074.5.074a.313.313,0,0,0,.169-.024c.077-.046.068-.115.116-.176,0-.067.032-.3.089-.337.04-.027.117-.008.164-.011a.714.714,0,0,0,.433-.1l-.011-.032c.035-.029.039-.094.048-.137a1,1,0,0,1,.1-.369l.011-.042.08-.38.047-.158a2.387,2.387,0,0,1,.092-.538,4.543,4.543,0,0,0,.035-.981c-.119.084-.222.191-.339.279a7.268,7.268,0,0,1-.854.542c-.581.323-1.226.5-1.825.788a3.1,3.1,0,0,0-.674.415c-.08.067-.164.221-.256.26a1.365,1.365,0,0,1-.389.028c-.315.026-.632.059-.95.073a1.281,1.281,0,0,1,.326-.308,3.452,3.452,0,0,1,.74-.428,8.054,8.054,0,0,1,.938-.284A12.859,12.859,0,0,0,69.34,29.5a5.549,5.549,0,0,0,.96-.566c.089-.068.269-.172.3-.286.025-.093-.076-.2-.088-.3a1.871,1.871,0,0,0-.34.238,3.855,3.855,0,0,1-.442.274,14.181,14.181,0,0,1-1.6.684,5.433,5.433,0,0,1-.674.189c-.07.018-.218.026-.264.083a.512.512,0,0,0-.19.042c-.141.038-.281.084-.422.122a5.149,5.149,0,0,0-1.794.782,2.452,2.452,0,0,0-.356.32c-.058.066-.124.189-.2.228a.481.481,0,0,1-.189.015c-.081,0-.16.02-.243.021-.26,0-.52.021-.781.021a1.7,1.7,0,0,1,.485-.529,4.991,4.991,0,0,1,1.614-.877c.4-.136.822-.184,1.234-.281a13.847,13.847,0,0,0,2.872-.86,5.15,5.15,0,0,0,1.192-.713,4.178,4.178,0,0,0-.647-.87c-.1-.1-.261-.231-.416-.191-.2.051-.211.245-.341.365m-3.335.116a1.719,1.719,0,0,1,.844.25,2.269,2.269,0,0,0,.844.183,1.414,1.414,0,0,0-.229-.274c-.185-.213-.4-.587-.71-.6a.891.891,0,0,0-.539.268A1.44,1.44,0,0,0,65.667,27.532Z" transform="translate(-59.458 -27.044)" fill="#fff"></path><svg>
            ${assist > 1 ? `<i>${assist}</i>` : ``}
        </div>
    `;
                }
                home_s.append(' <div class="col-3 d-inline-flex justify-content-center">\n' +
                    '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[home_team][S][i]['player']['row_id'] + '">\n' +
                    '                                                <a target="_blank" href="' + response.lineup[home_team][S][i]['player']['link'] + '" class="image-wrapper">\n' +
                    '                                                    <div class="img"><img src="' + response.lineup[home_team][S][i]['player']['image'] + '"></div>\n' +
                    '                                                    <span class="'+captain_h_s+'">' + response.lineup[home_team][S][i]['player']['player_number'] + '</span>\n' +
                    '                                                    ' +rating_h_s+ yellow_h_s + red_h_s + goal_h_s + xgoal_h_s + change_h_s + star_h_s + assist_h_s +
                    '                                                </a>\n' +
                    '                                                <div class="player-name">\n' +
                    '                                                    <h3>' + response.lineup[home_team][S][i]['player']['title'] + '</h3>\n' +
                    '                                                </div>\n' +
                    '                                           </div> ' +
                    '                                        </div>');


            }


        }

        if(response.lineup[away_team]){

            const str=away_formation,away_d=$('#away_D'),away_m=$('#away_M'),away_f=$('#away_F'),away_s=$('#away_S'),away_g=$('#away_G'),
                D="D",
                M="M",
                F="F",
                S="S",
                G="G",
                numberD =str.split('-')[0],
                numberM =str.split('-')[1],
                numberF =str.split('-')[2],
                numberS =str.split('-')[3];
            away_d.empty();
            away_m.empty();
            away_f.empty();
            away_s.empty();
            away_g.empty();
            var rating_a_g='';
            var red_a_g='';
            var yellow_a_g='';
            var goal_a_g='';
            var xgoal_a_g='';
            var change_a_g='';
            var star_a_g='';
            var assist_a_g='';
            var captain_a_g='';
            if(response.lineup[away_team][G][1]['captain'] ===1){
                captain_a_g="number_cap";
            }else{
                captain_a_g="number";
            }
            if(response.lineup[away_team][G][1]['rating'] !=null){
                const type_color=rating_c(response.lineup[away_team][G][1]['rating']);
                rating_a_g= '<span class="'+type_color+'">'+response.lineup[away_team][G][1]['rating']+'</span>';
            }
            if(response.lineup[away_team][G][1]['yellow'] !=null){
                yellow_a_g= '<div class="yellow-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#ffda46" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
            }
            if(response.lineup[away_team][G][1]['red'] !=null){
                red_a_g= '<div class="red-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#fc4d4d" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
            }
            if(response.lineup[away_team][G][1]['goal'] !=null){
                goal_a_g= '<div class="goals"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#5bd286"></path></svg>' +
                    '<i>'+response.lineup[away_team][G][1]['goal']+'</i></div>' ;
            }
            if(response.lineup[away_team][G][1]['own_goal'] !=null){
                xgoal_a_g= '<div class="x-goals"><i>'+response.lineup[away_team][G][1]['own_goal']+'</i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                    ' <path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#fc4d4d"></path></svg></div>' ;
            }
            if(response.lineup[away_team][G][1]['substitute'] !=null){
                change_a_g='<div class="change"><svg xmlns="http://www.w3.org/2000/svg" width="10.284" height="10.019" viewBox="0 0 10.284 10.019"><path id="next_1_" data-name="next (1)" d="M-1.971,29.6a.613.613,0,0,0-.866,0,.613.613,0,0,0,0,.866l.852.852h-7.43A.584.584,0,0,0-10,31.9a.584.584,0,0,0,.584.584h7.43l-.852.852a.613.613,0,0,0,0,.866.613.613,0,0,0,.866,0l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10 -29.417)" fill="#fc4d4d"></path>\n' +
                    '<path id="next_1_2" data-name="next (1)" d="M8.029.179a.613.613,0,0,0-.866.866l.852.852H.584a.584.584,0,0,0,0,1.169h7.43l-.852.852a.613.613,0,0,0,.866.866l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10.284 10.019) rotate(180)" fill="#5bd286"></path></svg></div>';
            }
            if(response.lineup[away_team][G][1]['man_match'] !=null){
                star_a_g='<div class="star"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path></svg></div>';
            }
            if(response.lineup[away_team][G][1]['assist'] !=null){
                assist_a_g='<div class="assist"><svg xmlns="http://www.w3.org/2000/svg" width="11.192" height="5.134" viewBox="0 0 11.192 5.134"><path id="Path_54488" data-name="Path 54488" d="M69,27.416l.011.021c-.047.031-.073.093-.109.137a1.606,1.606,0,0,1-.229.231,1.916,1.916,0,0,1-1.245.423,2.774,2.774,0,0,1-.971-.193,1.456,1.456,0,0,0-.929-.241,1.184,1.184,0,0,0-.454.318v.011l.074.074c.034.183.315.294.333.485a.145.145,0,0,1-.228.118.716.716,0,0,1-.119-.137,3.523,3.523,0,0,1-.282-.361l-.306.166-.718.373a1.765,1.765,0,0,0,.18.336.434.434,0,0,1,.1.234.142.142,0,0,1-.25.08.773.773,0,0,1-.11-.185,2.173,2.173,0,0,1-.187-.338,7.707,7.707,0,0,0-.834.313c-.261.1-.534.16-.8.236a2.183,2.183,0,0,1-.58.158,1.418,1.418,0,0,1-.506.132,6.951,6.951,0,0,0-.76.223,1.289,1.289,0,0,0-.378.182.9.9,0,0,0-.245.794c0,.111-.027.248.057.335a.334.334,0,0,0,.165.066,2.317,2.317,0,0,0,.412.105l.063.338c.058.075.024.2.1.269a.213.213,0,0,0,.155.048c.135,0,.372.045.484-.041.055-.042.046-.11.086-.16l.053-.285.749.084.032.19c.048.059.034.132.106.18a.382.382,0,0,0,.222.031.757.757,0,0,0,.485-.084l.011-.032.042-.243,2.575-.032,1.963-.084a.831.831,0,0,0,.118.419c.113.109.38.056.525.056a.236.236,0,0,0,.168-.047c.115-.1.052-.3.138-.406l-.011-.042a2.984,2.984,0,0,1,.338-.02.253.253,0,0,1,.134.01c.036.024.037.088.045.126a.849.849,0,0,0,.092.306c.091.129.362.074.5.074a.313.313,0,0,0,.169-.024c.077-.046.068-.115.116-.176,0-.067.032-.3.089-.337.04-.027.117-.008.164-.011a.714.714,0,0,0,.433-.1l-.011-.032c.035-.029.039-.094.048-.137a1,1,0,0,1,.1-.369l.011-.042.08-.38.047-.158a2.387,2.387,0,0,1,.092-.538,4.543,4.543,0,0,0,.035-.981c-.119.084-.222.191-.339.279a7.268,7.268,0,0,1-.854.542c-.581.323-1.226.5-1.825.788a3.1,3.1,0,0,0-.674.415c-.08.067-.164.221-.256.26a1.365,1.365,0,0,1-.389.028c-.315.026-.632.059-.95.073a1.281,1.281,0,0,1,.326-.308,3.452,3.452,0,0,1,.74-.428,8.054,8.054,0,0,1,.938-.284A12.859,12.859,0,0,0,69.34,29.5a5.549,5.549,0,0,0,.96-.566c.089-.068.269-.172.3-.286.025-.093-.076-.2-.088-.3a1.871,1.871,0,0,0-.34.238,3.855,3.855,0,0,1-.442.274,14.181,14.181,0,0,1-1.6.684,5.433,5.433,0,0,1-.674.189c-.07.018-.218.026-.264.083a.512.512,0,0,0-.19.042c-.141.038-.281.084-.422.122a5.149,5.149,0,0,0-1.794.782,2.452,2.452,0,0,0-.356.32c-.058.066-.124.189-.2.228a.481.481,0,0,1-.189.015c-.081,0-.16.02-.243.021-.26,0-.52.021-.781.021a1.7,1.7,0,0,1,.485-.529,4.991,4.991,0,0,1,1.614-.877c.4-.136.822-.184,1.234-.281a13.847,13.847,0,0,0,2.872-.86,5.15,5.15,0,0,0,1.192-.713,4.178,4.178,0,0,0-.647-.87c-.1-.1-.261-.231-.416-.191-.2.051-.211.245-.341.365m-3.335.116a1.719,1.719,0,0,1,.844.25,2.269,2.269,0,0,0,.844.183,1.414,1.414,0,0,0-.229-.274c-.185-.213-.4-.587-.71-.6a.891.891,0,0,0-.539.268A1.44,1.44,0,0,0,65.667,27.532Z" transform="translate(-59.458 -27.044)" fill="#fff"></path><svg></div>';
            }
            away_g.append('<div class="col-12 d-inline-flex justify-content-center">\n' +
                '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[away_team][G][1]['player']['row_id'] + '">\n' +
                '                                                <a target="_blank" href="' + response.lineup[away_team][G][1]['player']['link'] + '" class="image-wrapper">\n' +
                '                                                    <div class="img"><img src="' + response.lineup[away_team][G][1]['player']['image'] + '"></div>\n' +
                '                                                    <span class="'+captain_a_g+'">' + response.lineup[away_team][G][1]['player']['player_number'] + '</span>\n' +
                '                                                    ' +rating_a_g+ yellow_a_g + red_a_g + goal_a_g + xgoal_a_g + change_a_g + star_a_g + assist_a_g +
                '                                                </a>\n' +
                '                                                <div class="player-name">\n' +
                '                                                    <h3>' + response.lineup[away_team][G][1]['player']['title'] + '</h3>\n' +
                '                                                </div>\n' +
                '                                           </div> ' +
                '                                        </div>');

            for (let i = 1; i <= numberD; i++) {
                var rating_a_d='';
                var red_a_d='';
                var yellow_a_d='';
                var goal_a_d='';
                var xgoal_a_d='';
                var change_a_d='';
                var star_a_d='';
                var assist_a_d='';
                var captain_a_d='';
                if(response.lineup[away_team][D][i]['captain'] ===1){
                    captain_a_d="number_cap";
                }else{
                    captain_a_d="number";
                }
                if(response.lineup[away_team][D][i]['rating'] !=null){
                    const type_color=rating_c(response.lineup[away_team][D][i]['rating']);
                    rating_a_d= '<span class="'+type_color+'">'+response.lineup[away_team][D][i]['rating']+'</span>';
                }
                if(response.lineup[away_team][D][i]['yellow'] !=null){
                    yellow_a_d= '<div class="yellow-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#ffda46" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[away_team][D][i]['red'] !=null){
                    red_a_d= '<div class="red-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#fc4d4d" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[away_team][D][i]['goal'] !=null){
                    goal_a_d= '<div class="goals"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#5bd286"></path></svg>' +
                        '<i>'+response.lineup[away_team][D][i]['goal']+'</i></div>' ;
                }
                if(response.lineup[away_team][D][i]['own_goal'] !=null){
                    xgoal_a_d= '<div class="x-goals"><i>'+response.lineup[away_team][D][i]['own_goal']+'</i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                        ' <path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#fc4d4d"></path></svg></div>' ;
                }
                if(response.lineup[away_team][D][i]['substitute'] !=null){
                    change_a_d='<div class="change"><svg xmlns="http://www.w3.org/2000/svg" width="10.284" height="10.019" viewBox="0 0 10.284 10.019"><path id="next_1_" data-name="next (1)" d="M-1.971,29.6a.613.613,0,0,0-.866,0,.613.613,0,0,0,0,.866l.852.852h-7.43A.584.584,0,0,0-10,31.9a.584.584,0,0,0,.584.584h7.43l-.852.852a.613.613,0,0,0,0,.866.613.613,0,0,0,.866,0l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10 -29.417)" fill="#fc4d4d"></path>\n' +
                        '<path id="next_1_2" data-name="next (1)" d="M8.029.179a.613.613,0,0,0-.866.866l.852.852H.584a.584.584,0,0,0,0,1.169h7.43l-.852.852a.613.613,0,0,0,.866.866l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10.284 10.019) rotate(180)" fill="#5bd286"></path></svg></div>';
                }
                if(response.lineup[away_team][D][i]['man_match'] !=null){
                    star_a_d='<div class="star"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path></svg></div>';
                }
                if(response.lineup[away_team][D][i]['assist'] !=null){
                    const assist=response.lineup[away_team][D][i]['assist'];
                    assist_a_d = `
        <div class="assist">
      <svg xmlns="http://www.w3.org/2000/svg" width="11.192" height="5.134" viewBox="0 0 11.192 5.134"><path id="Path_54488" data-name="Path 54488" d="M69,27.416l.011.021c-.047.031-.073.093-.109.137a1.606,1.606,0,0,1-.229.231,1.916,1.916,0,0,1-1.245.423,2.774,2.774,0,0,1-.971-.193,1.456,1.456,0,0,0-.929-.241,1.184,1.184,0,0,0-.454.318v.011l.074.074c.034.183.315.294.333.485a.145.145,0,0,1-.228.118.716.716,0,0,1-.119-.137,3.523,3.523,0,0,1-.282-.361l-.306.166-.718.373a1.765,1.765,0,0,0,.18.336.434.434,0,0,1,.1.234.142.142,0,0,1-.25.08.773.773,0,0,1-.11-.185,2.173,2.173,0,0,1-.187-.338,7.707,7.707,0,0,0-.834.313c-.261.1-.534.16-.8.236a2.183,2.183,0,0,1-.58.158,1.418,1.418,0,0,1-.506.132,6.951,6.951,0,0,0-.76.223,1.289,1.289,0,0,0-.378.182.9.9,0,0,0-.245.794c0,.111-.027.248.057.335a.334.334,0,0,0,.165.066,2.317,2.317,0,0,0,.412.105l.063.338c.058.075.024.2.1.269a.213.213,0,0,0,.155.048c.135,0,.372.045.484-.041.055-.042.046-.11.086-.16l.053-.285.749.084.032.19c.048.059.034.132.106.18a.382.382,0,0,0,.222.031.757.757,0,0,0,.485-.084l.011-.032.042-.243,2.575-.032,1.963-.084a.831.831,0,0,0,.118.419c.113.109.38.056.525.056a.236.236,0,0,0,.168-.047c.115-.1.052-.3.138-.406l-.011-.042a2.984,2.984,0,0,1,.338-.02.253.253,0,0,1,.134.01c.036.024.037.088.045.126a.849.849,0,0,0,.092.306c.091.129.362.074.5.074a.313.313,0,0,0,.169-.024c.077-.046.068-.115.116-.176,0-.067.032-.3.089-.337.04-.027.117-.008.164-.011a.714.714,0,0,0,.433-.1l-.011-.032c.035-.029.039-.094.048-.137a1,1,0,0,1,.1-.369l.011-.042.08-.38.047-.158a2.387,2.387,0,0,1,.092-.538,4.543,4.543,0,0,0,.035-.981c-.119.084-.222.191-.339.279a7.268,7.268,0,0,1-.854.542c-.581.323-1.226.5-1.825.788a3.1,3.1,0,0,0-.674.415c-.08.067-.164.221-.256.26a1.365,1.365,0,0,1-.389.028c-.315.026-.632.059-.95.073a1.281,1.281,0,0,1,.326-.308,3.452,3.452,0,0,1,.74-.428,8.054,8.054,0,0,1,.938-.284A12.859,12.859,0,0,0,69.34,29.5a5.549,5.549,0,0,0,.96-.566c.089-.068.269-.172.3-.286.025-.093-.076-.2-.088-.3a1.871,1.871,0,0,0-.34.238,3.855,3.855,0,0,1-.442.274,14.181,14.181,0,0,1-1.6.684,5.433,5.433,0,0,1-.674.189c-.07.018-.218.026-.264.083a.512.512,0,0,0-.19.042c-.141.038-.281.084-.422.122a5.149,5.149,0,0,0-1.794.782,2.452,2.452,0,0,0-.356.32c-.058.066-.124.189-.2.228a.481.481,0,0,1-.189.015c-.081,0-.16.02-.243.021-.26,0-.52.021-.781.021a1.7,1.7,0,0,1,.485-.529,4.991,4.991,0,0,1,1.614-.877c.4-.136.822-.184,1.234-.281a13.847,13.847,0,0,0,2.872-.86,5.15,5.15,0,0,0,1.192-.713,4.178,4.178,0,0,0-.647-.87c-.1-.1-.261-.231-.416-.191-.2.051-.211.245-.341.365m-3.335.116a1.719,1.719,0,0,1,.844.25,2.269,2.269,0,0,0,.844.183,1.414,1.414,0,0,0-.229-.274c-.185-.213-.4-.587-.71-.6a.891.891,0,0,0-.539.268A1.44,1.44,0,0,0,65.667,27.532Z" transform="translate(-59.458 -27.044)" fill="#fff"></path><svg>
            ${assist > 1 ? `<i>${assist}</i>` : ``}
        </div>
    `;
                }

                if (numberD === '1' || numberD === '2' || numberD === '3' || numberD === '4') {
                    away_d.append('<div class="col-3 d-inline-flex justify-content-center">' +
                        '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[away_team][D][i]['player']['row_id'] + '">\n' +
                        '                                                <a target="_blank" href="' + response.lineup[away_team][D][i]['player']['link'] + '" class="image-wrapper">\n' +
                        '                                                    <div class="img"><img src="' + response.lineup[away_team][D][i]['player']['image'] + '"></div>\n' +
                        '                                                    <span class="'+captain_a_d+'">' + response.lineup[away_team][D][i]['player']['player_number'] + '</span>\n' +
                        '                                                    ' +rating_a_d+ yellow_a_d + red_a_d + goal_a_d + xgoal_a_d + change_a_d + star_a_d + assist_a_d +
                        '                                                </a>\n' +
                        '                                                <div class="player-name">\n' +
                        '                                                    <h3>' + response.lineup[away_team][D][i]['player']['title'] + '</h3>\n' +
                        '                                                </div>\n' +
                        '                                           </div> ' +
                        '                                             </div>');

                }
                if (numberD === '5') {
                    away_d.append('<div class="col-2-5 d-inline-flex justify-content-center pda' + i + '">' +
                        '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[away_team][D][i]['player']['row_id'] + '">\n' +
                        '                                                <a target="_blank" href="' + response.lineup[away_team][D][i]['player']['link'] + '" class="image-wrapper">\n' +
                        '                                                    <div class="img"><img src="' + response.lineup[away_team][D][i]['player']['image'] + '"></div>\n' +
                        '                                                    <span class="'+captain_a_d+'">' + response.lineup[away_team][D][i]['player']['player_number'] + '</span>\n' +
                        '                                                    ' +rating_a_d+ yellow_a_d + red_a_d + goal_a_d + xgoal_a_d + change_a_d + star_a_d + assist_a_d +
                        '                                                </a>\n' +
                        '                                                <div class="player-name">\n' +
                        '                                                    <h3>' + response.lineup[away_team][D][i]['player']['title'] + '</h3>\n' +
                        '                                                </div>\n' +
                        '                                           </div> ' +
                        '                                             </div>');



                    if (i === 1) {
                        $('.pda' + i).css('margin-top', '-5%');
                    } else if (i === 5) {
                        $('.pda' + i).css('margin-top', '-5%');
                    }

                }

            }


            for (let i = 1; i <= numberM; i++) {
                var rating_a_m='';
                var red_a_m='';
                var yellow_a_m='';
                var goal_a_m='';
                var xgoal_a_m='';
                var change_a_m='';
                var star_a_m='';
                var assist_a_m='';
                var captain_a_m='';
                if(response.lineup[away_team][M][i]['captain'] ===1){
                    captain_a_m="number_cap";
                }else{
                    captain_a_m="number";
                }
                if(response.lineup[away_team][M][i]['rating'] !=null){
                    const type_color=rating_c(response.lineup[away_team][M][i]['rating']);
                    rating_a_m= '<span class="'+type_color+'">'+response.lineup[away_team][M][i]['rating']+'</span>';
                }
                if(response.lineup[away_team][M][i]['yellow'] !=null){
                    yellow_a_m= '<div class="yellow-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#ffda46" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[away_team][M][i]['red'] !=null){
                    red_a_m= '<div class="red-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#fc4d4d" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[away_team][M][i]['goal'] !=null){
                    goal_a_m= '<div class="goals"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#5bd286"></path></svg>' +
                        '<i>'+response.lineup[away_team][M][i]['goal']+'</i></div>' ;
                }
                if(response.lineup[away_team][M][i]['own_goal'] !=null){
                    xgoal_a_m= '<div class="x-goals"><i>'+response.lineup[away_team][M][i]['own_goal']+'</i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                        ' <path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#fc4d4d"></path></svg></div>' ;
                }
                if(response.lineup[away_team][M][i]['substitute'] !=null){
                    change_a_m='<div class="change"><svg xmlns="http://www.w3.org/2000/svg" width="10.284" height="10.019" viewBox="0 0 10.284 10.019"><path id="next_1_" data-name="next (1)" d="M-1.971,29.6a.613.613,0,0,0-.866,0,.613.613,0,0,0,0,.866l.852.852h-7.43A.584.584,0,0,0-10,31.9a.584.584,0,0,0,.584.584h7.43l-.852.852a.613.613,0,0,0,0,.866.613.613,0,0,0,.866,0l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10 -29.417)" fill="#fc4d4d"></path>\n' +
                        '<path id="next_1_2" data-name="next (1)" d="M8.029.179a.613.613,0,0,0-.866.866l.852.852H.584a.584.584,0,0,0,0,1.169h7.43l-.852.852a.613.613,0,0,0,.866.866l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10.284 10.019) rotate(180)" fill="#5bd286"></path></svg></div>';
                }
                if(response.lineup[away_team][M][i]['man_match'] !=null){
                    star_a_m='<div class="star"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path></svg></div>';
                }

                if(response.lineup[away_team][M][i]['assist'] !=null){
                    const assist=response.lineup[away_team][M][i]['assist'];
                    assist_a_m = `
        <div class="assist">
      <svg xmlns="http://www.w3.org/2000/svg" width="11.192" height="5.134" viewBox="0 0 11.192 5.134"><path id="Path_54488" data-name="Path 54488" d="M69,27.416l.011.021c-.047.031-.073.093-.109.137a1.606,1.606,0,0,1-.229.231,1.916,1.916,0,0,1-1.245.423,2.774,2.774,0,0,1-.971-.193,1.456,1.456,0,0,0-.929-.241,1.184,1.184,0,0,0-.454.318v.011l.074.074c.034.183.315.294.333.485a.145.145,0,0,1-.228.118.716.716,0,0,1-.119-.137,3.523,3.523,0,0,1-.282-.361l-.306.166-.718.373a1.765,1.765,0,0,0,.18.336.434.434,0,0,1,.1.234.142.142,0,0,1-.25.08.773.773,0,0,1-.11-.185,2.173,2.173,0,0,1-.187-.338,7.707,7.707,0,0,0-.834.313c-.261.1-.534.16-.8.236a2.183,2.183,0,0,1-.58.158,1.418,1.418,0,0,1-.506.132,6.951,6.951,0,0,0-.76.223,1.289,1.289,0,0,0-.378.182.9.9,0,0,0-.245.794c0,.111-.027.248.057.335a.334.334,0,0,0,.165.066,2.317,2.317,0,0,0,.412.105l.063.338c.058.075.024.2.1.269a.213.213,0,0,0,.155.048c.135,0,.372.045.484-.041.055-.042.046-.11.086-.16l.053-.285.749.084.032.19c.048.059.034.132.106.18a.382.382,0,0,0,.222.031.757.757,0,0,0,.485-.084l.011-.032.042-.243,2.575-.032,1.963-.084a.831.831,0,0,0,.118.419c.113.109.38.056.525.056a.236.236,0,0,0,.168-.047c.115-.1.052-.3.138-.406l-.011-.042a2.984,2.984,0,0,1,.338-.02.253.253,0,0,1,.134.01c.036.024.037.088.045.126a.849.849,0,0,0,.092.306c.091.129.362.074.5.074a.313.313,0,0,0,.169-.024c.077-.046.068-.115.116-.176,0-.067.032-.3.089-.337.04-.027.117-.008.164-.011a.714.714,0,0,0,.433-.1l-.011-.032c.035-.029.039-.094.048-.137a1,1,0,0,1,.1-.369l.011-.042.08-.38.047-.158a2.387,2.387,0,0,1,.092-.538,4.543,4.543,0,0,0,.035-.981c-.119.084-.222.191-.339.279a7.268,7.268,0,0,1-.854.542c-.581.323-1.226.5-1.825.788a3.1,3.1,0,0,0-.674.415c-.08.067-.164.221-.256.26a1.365,1.365,0,0,1-.389.028c-.315.026-.632.059-.95.073a1.281,1.281,0,0,1,.326-.308,3.452,3.452,0,0,1,.74-.428,8.054,8.054,0,0,1,.938-.284A12.859,12.859,0,0,0,69.34,29.5a5.549,5.549,0,0,0,.96-.566c.089-.068.269-.172.3-.286.025-.093-.076-.2-.088-.3a1.871,1.871,0,0,0-.34.238,3.855,3.855,0,0,1-.442.274,14.181,14.181,0,0,1-1.6.684,5.433,5.433,0,0,1-.674.189c-.07.018-.218.026-.264.083a.512.512,0,0,0-.19.042c-.141.038-.281.084-.422.122a5.149,5.149,0,0,0-1.794.782,2.452,2.452,0,0,0-.356.32c-.058.066-.124.189-.2.228a.481.481,0,0,1-.189.015c-.081,0-.16.02-.243.021-.26,0-.52.021-.781.021a1.7,1.7,0,0,1,.485-.529,4.991,4.991,0,0,1,1.614-.877c.4-.136.822-.184,1.234-.281a13.847,13.847,0,0,0,2.872-.86,5.15,5.15,0,0,0,1.192-.713,4.178,4.178,0,0,0-.647-.87c-.1-.1-.261-.231-.416-.191-.2.051-.211.245-.341.365m-3.335.116a1.719,1.719,0,0,1,.844.25,2.269,2.269,0,0,0,.844.183,1.414,1.414,0,0,0-.229-.274c-.185-.213-.4-.587-.71-.6a.891.891,0,0,0-.539.268A1.44,1.44,0,0,0,65.667,27.532Z" transform="translate(-59.458 -27.044)" fill="#fff"></path><svg>
            ${assist > 1 ? `<i>${assist}</i>` : ``}
        </div>
    `;
                }

                if (numberM === '1' || numberM === '2' || numberM === '3' || numberM === '4') {

                    away_m.append(' <div class="col-3 d-inline-flex justify-content-center pma' + i + '">\n' +
                        '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[away_team][M][i]['player']['row_id'] + '">\n' +
                        '                                                <a target="_blank" href="' + response.lineup[away_team][M][i]['player']['link'] + '" class="image-wrapper">\n' +
                        '                                                    <div class="img"><img src="' + response.lineup[away_team][M][i]['player']['image'] + '"></div>\n' +
                        '                                                    <span class="'+captain_a_m+'">' + response.lineup[away_team][M][i]['player']['player_number'] + '</span>\n' +
                        '                                                    ' +rating_a_m+ yellow_a_m + red_a_m + goal_a_m + xgoal_a_m + change_a_m + star_a_m + assist_a_m +
                        '                                                </a>\n' +
                        '                                                <div class="player-name">\n' +
                        '                                                    <h3>' + response.lineup[away_team][M][i]['player']['title'] + '</h3>\n' +
                        '                                                </div>\n' +
                        '                                           </div> ' +
                        '                                        </div>');

                }
                if (numberM === '5') {
                    away_m.append('<div class="col-2-5 d-inline-flex justify-content-center pma' + i + '">\n' +
                        '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[away_team][M][i]['player']['row_id'] + '">\n' +
                        '                                                <a target="_blank" href="' + response.lineup[away_team][M][i]['player']['link'] + '" class="image-wrapper">\n' +
                        '                                                    <div class="img"><img src="' + response.lineup[away_team][M][i]['player']['image'] + '"></div>\n' +
                        '                                                    <span class="'+captain_a_m+'">' + response.lineup[away_team][M][i]['player']['player_number'] + '</span>\n' +
                        '                                                    ' +rating_a_m+ yellow_a_m + red_a_m + goal_a_m + xgoal_a_m + change_a_m + star_a_m + assist_a_m +
                        '                                                </a>\n' +
                        '                                                <div class="player-name">\n' +
                        '                                                    <h3>' + response.lineup[away_team][M][i]['player']['title'] + '</h3>\n' +
                        '                                                </div>\n' +
                        '                                           </div> ' +
                        '                                        </div>');

                    if (i === 1) {
                        $('.pma' + i).css('margin-top', '-5%');
                    } else if (i === 5) {
                        $('.pma' + i).css('margin-top', '-5%');
                    }

                }
                if (numberM === '3') {
                    if (i === 1) {
                        if (numberS === undefined) {
                            $('.pma' + i).css('margin-top', '-8%');
                        }
                    }else if (i === 3) {
                        if (numberS === undefined) {
                            $('.pma' + i).css('margin-top', '-8%');
                        }
                    }
                }

                if (numberM === '4') {
                    if (i === 1) {
                        if (numberS === undefined) {
                            $('.pma' + i).css('margin-top', '-8%');
                        }
                    }else if (i === 4) {
                        if (numberS === undefined) {
                            $('.pma' + i).css('margin-top', '-8%');
                        }
                    }
                }

            }


            for (let i = 1; i <= numberF; i++) {
                var rating_a_f='';
                var red_a_f='';
                var yellow_a_f='';
                var goal_a_f='';
                var xgoal_a_f='';
                var change_a_f='';
                var star_a_f='';
                var assist_a_f='';
                var captain_a_f='';
                if(response.lineup[away_team][F][i]['captain'] ===1){
                    captain_a_f="number_cap";
                }else{
                    captain_a_f="number";
                }
                if(response.lineup[away_team][F][i]['rating'] !=null){
                    const type_color=rating_c(response.lineup[away_team][F][i]['rating']);
                    rating_a_f= '<span class="'+type_color+'">'+response.lineup[away_team][F][i]['rating']+'</span>';
                }
                if(response.lineup[away_team][F][i]['yellow'] !=null){
                    yellow_a_f= '<div class="yellow-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#ffda46" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[away_team][F][i]['red'] !=null){
                    red_a_f= '<div class="red-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#fc4d4d" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[away_team][F][i]['goal'] !=null){
                    goal_a_f= '<div class="goals"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#5bd286"></path></svg>' +
                        '<i>'+response.lineup[away_team][F][i]['goal']+'</i></div>' ;
                }
                if(response.lineup[away_team][F][i]['own_goal'] !=null){
                    xgoal_a_f= '<div class="x-goals"><i>'+response.lineup[away_team][F][i]['own_goal']+'</i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                        ' <path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#fc4d4d"></path></svg></div>' ;
                }
                if(response.lineup[away_team][F][i]['substitute'] !=null){
                    change_a_f='<div class="change"><svg xmlns="http://www.w3.org/2000/svg" width="10.284" height="10.019" viewBox="0 0 10.284 10.019"><path id="next_1_" data-name="next (1)" d="M-1.971,29.6a.613.613,0,0,0-.866,0,.613.613,0,0,0,0,.866l.852.852h-7.43A.584.584,0,0,0-10,31.9a.584.584,0,0,0,.584.584h7.43l-.852.852a.613.613,0,0,0,0,.866.613.613,0,0,0,.866,0l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10 -29.417)" fill="#fc4d4d"></path>\n' +
                        '<path id="next_1_2" data-name="next (1)" d="M8.029.179a.613.613,0,0,0-.866.866l.852.852H.584a.584.584,0,0,0,0,1.169h7.43l-.852.852a.613.613,0,0,0,.866.866l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10.284 10.019) rotate(180)" fill="#5bd286"></path></svg></div>';
                }
                if(response.lineup[away_team][F][i]['man_match'] !=null){
                    star_a_f='<div class="star"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path></svg></div>';
                }
                if(response.lineup[away_team][F][i]['assist'] !=null){
                    const assist=response.lineup[away_team][F][i]['assist'];
                    assist_a_f = `
        <div class="assist">
      <svg xmlns="http://www.w3.org/2000/svg" width="11.192" height="5.134" viewBox="0 0 11.192 5.134"><path id="Path_54488" data-name="Path 54488" d="M69,27.416l.011.021c-.047.031-.073.093-.109.137a1.606,1.606,0,0,1-.229.231,1.916,1.916,0,0,1-1.245.423,2.774,2.774,0,0,1-.971-.193,1.456,1.456,0,0,0-.929-.241,1.184,1.184,0,0,0-.454.318v.011l.074.074c.034.183.315.294.333.485a.145.145,0,0,1-.228.118.716.716,0,0,1-.119-.137,3.523,3.523,0,0,1-.282-.361l-.306.166-.718.373a1.765,1.765,0,0,0,.18.336.434.434,0,0,1,.1.234.142.142,0,0,1-.25.08.773.773,0,0,1-.11-.185,2.173,2.173,0,0,1-.187-.338,7.707,7.707,0,0,0-.834.313c-.261.1-.534.16-.8.236a2.183,2.183,0,0,1-.58.158,1.418,1.418,0,0,1-.506.132,6.951,6.951,0,0,0-.76.223,1.289,1.289,0,0,0-.378.182.9.9,0,0,0-.245.794c0,.111-.027.248.057.335a.334.334,0,0,0,.165.066,2.317,2.317,0,0,0,.412.105l.063.338c.058.075.024.2.1.269a.213.213,0,0,0,.155.048c.135,0,.372.045.484-.041.055-.042.046-.11.086-.16l.053-.285.749.084.032.19c.048.059.034.132.106.18a.382.382,0,0,0,.222.031.757.757,0,0,0,.485-.084l.011-.032.042-.243,2.575-.032,1.963-.084a.831.831,0,0,0,.118.419c.113.109.38.056.525.056a.236.236,0,0,0,.168-.047c.115-.1.052-.3.138-.406l-.011-.042a2.984,2.984,0,0,1,.338-.02.253.253,0,0,1,.134.01c.036.024.037.088.045.126a.849.849,0,0,0,.092.306c.091.129.362.074.5.074a.313.313,0,0,0,.169-.024c.077-.046.068-.115.116-.176,0-.067.032-.3.089-.337.04-.027.117-.008.164-.011a.714.714,0,0,0,.433-.1l-.011-.032c.035-.029.039-.094.048-.137a1,1,0,0,1,.1-.369l.011-.042.08-.38.047-.158a2.387,2.387,0,0,1,.092-.538,4.543,4.543,0,0,0,.035-.981c-.119.084-.222.191-.339.279a7.268,7.268,0,0,1-.854.542c-.581.323-1.226.5-1.825.788a3.1,3.1,0,0,0-.674.415c-.08.067-.164.221-.256.26a1.365,1.365,0,0,1-.389.028c-.315.026-.632.059-.95.073a1.281,1.281,0,0,1,.326-.308,3.452,3.452,0,0,1,.74-.428,8.054,8.054,0,0,1,.938-.284A12.859,12.859,0,0,0,69.34,29.5a5.549,5.549,0,0,0,.96-.566c.089-.068.269-.172.3-.286.025-.093-.076-.2-.088-.3a1.871,1.871,0,0,0-.34.238,3.855,3.855,0,0,1-.442.274,14.181,14.181,0,0,1-1.6.684,5.433,5.433,0,0,1-.674.189c-.07.018-.218.026-.264.083a.512.512,0,0,0-.19.042c-.141.038-.281.084-.422.122a5.149,5.149,0,0,0-1.794.782,2.452,2.452,0,0,0-.356.32c-.058.066-.124.189-.2.228a.481.481,0,0,1-.189.015c-.081,0-.16.02-.243.021-.26,0-.52.021-.781.021a1.7,1.7,0,0,1,.485-.529,4.991,4.991,0,0,1,1.614-.877c.4-.136.822-.184,1.234-.281a13.847,13.847,0,0,0,2.872-.86,5.15,5.15,0,0,0,1.192-.713,4.178,4.178,0,0,0-.647-.87c-.1-.1-.261-.231-.416-.191-.2.051-.211.245-.341.365m-3.335.116a1.719,1.719,0,0,1,.844.25,2.269,2.269,0,0,0,.844.183,1.414,1.414,0,0,0-.229-.274c-.185-.213-.4-.587-.71-.6a.891.891,0,0,0-.539.268A1.44,1.44,0,0,0,65.667,27.532Z" transform="translate(-59.458 -27.044)" fill="#fff"></path><svg>
            ${assist > 1 ? `<i>${assist}</i>` : ``}
        </div>
    `;
                }

                away_f.append(' <div class="col-3 d-inline-flex justify-content-center">\n' +
                    '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[away_team][F][i]['player']['row_id'] + '">\n' +
                    '                                                <a target="_blank" href="' + response.lineup[away_team][F][i]['player']['link'] + '" class="image-wrapper">\n' +
                    '                                                    <div class="img"><img src="' + response.lineup[away_team][F][i]['player']['image'] + '"></div>\n' +
                    '                                                    <span class="'+captain_a_f+'">' + response.lineup[away_team][F][i]['player']['player_number'] + '</span>\n' +
                    '                                                    ' +rating_a_f+ yellow_a_f + red_a_f + goal_a_f + xgoal_a_f + change_a_f + star_a_f + assist_a_f +
                    '                                                </a>\n' +
                    '                                                <div class="player-name">\n' +
                    '                                                    <h3>' + response.lineup[away_team][F][i]['player']['title'] + '</h3>\n' +
                    '                                                </div>\n' +
                    '                                           </div> ' +
                    '                                        </div>');
                if(numberS ===undefined){
                    $('.away_f').addClass('m-t-10');
                }

            }


            for (let i = 1; i <= numberS; i++) {

                var rating_a_s='';
                var red_a_s='';
                var yellow_a_s='';
                var goal_a_s='';
                var xgoal_a_s='';
                var change_a_s='';
                var star_a_s='';
                var assist_a_s='';
                var captain_a_s='';
                if(response.lineup[away_team][S][i]['captain'] ===1){
                    captain_a_s="number_cap";
                }else{
                    captain_a_s="number";
                }
                if(response.lineup[away_team][S][i]['rating'] !=null){
                    const type_color=rating_c(response.lineup[away_team][S][i]['rating']);
                    rating_a_s= '<span class="'+type_color+'">'+response.lineup[away_team][S][i]['rating']+'</span>';
                }
                if(response.lineup[away_team][S][i]['yellow'] !=null){
                    yellow_a_s= '<div class="yellow-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#ffda46" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[away_team][S][i]['red'] !=null){
                    red_a_s= '<div class="red-card"><svg xmlns="http://www.w3.org/2000/svg" width="13.083" height="18.447" viewBox="0 0 13.083 18.447"><path id="Path_53340" data-name="Path 53340" d="M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z" transform="translate(187.102 69.819)" fill="#fc4d4d" stroke="rgba(0,0,0,0)" stroke-width="1"></path></svg></div>';
                }
                if(response.lineup[away_team][S][i]['goal'] !=null){
                    goal_a_s= '<div class="goals"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#5bd286"></path></svg>' +
                        '<i>'+response.lineup[away_team][S][i]['goal']+'</i></div>' ;
                }
                if(response.lineup[away_team][S][i]['own_goal'] !=null){
                    xgoal_a_s= '<div class="x-goals"><i>'+response.lineup[away_team][S][i]['own_goal']+'</i><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">\n' +
                        ' <path id="Path_53339" data-name="Path 53339" d="M8,0a8,8,0,1,0,8,8A8.009,8.009,0,0,0,8,0Zm.508,2.6,2.057-1.106a7.033,7.033,0,0,1,2.889,2.13l-.49,2.262-1.569.769-2.887-2.1ZM5.452,1.487,7.509,2.6V4.551l-2.885,2.1-1.577-.77-.49-2.276A7.023,7.023,0,0,1,5.452,1.487ZM2.23,11.954a6.954,6.954,0,0,1-1.2-3.274L2.728,6.841,4.272,7.6l1.163,3.3-.983,1.178Zm7.553,2.807a6.871,6.871,0,0,1-3.922-.1L5.232,12.7l1-1.205H9.769l.985,1.166Zm1.751-2.718L10.567,10.9l1.179-3.3,1.537-.753,1.683,1.838a6.934,6.934,0,0,1-.945,2.871Z" fill="#fc4d4d"></path></svg></div>' ;
                }
                if(response.lineup[away_team][S][i]['substitute'] !=null){
                    change_a_s='<div class="change"><svg xmlns="http://www.w3.org/2000/svg" width="10.284" height="10.019" viewBox="0 0 10.284 10.019"><path id="next_1_" data-name="next (1)" d="M-1.971,29.6a.613.613,0,0,0-.866,0,.613.613,0,0,0,0,.866l.852.852h-7.43A.584.584,0,0,0-10,31.9a.584.584,0,0,0,.584.584h7.43l-.852.852a.613.613,0,0,0,0,.866.613.613,0,0,0,.866,0l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10 -29.417)" fill="#fc4d4d"></path>\n' +
                        '<path id="next_1_2" data-name="next (1)" d="M8.029.179a.613.613,0,0,0-.866.866l.852.852H.584a.584.584,0,0,0,0,1.169h7.43l-.852.852a.613.613,0,0,0,.866.866l2.22-2.22a.117.117,0,0,0,0-.165Z" transform="translate(10.284 10.019) rotate(180)" fill="#5bd286"></path></svg></div>';
                }
                if(response.lineup[away_team][S][i]['man_match'] !=null){
                    star_a_s='<div class="star"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path id="Shape" d="M7.6,9.944,5,8.516,2.4,9.944a.438.438,0,0,1-.479-.036.486.486,0,0,1-.181-.465l.5-3.027-2.1-2.14a.491.491,0,0,1-.115-.488.461.461,0,0,1,.368-.323l2.9-.444L4.589.265a.446.446,0,0,1,.815,0L6.7,3.019l2.9.444a.461.461,0,0,1,.368.323.491.491,0,0,1-.115.489L7.76,6.416l.5,3.027a.486.486,0,0,1-.182.465A.438.438,0,0,1,7.6,9.944Z" transform="translate(0.002 0.001)" fill="#ffc420"></path></svg></div>';
                }
                if(response.lineup[away_team][S][i]['assist'] !=null){
                    const assist=response.lineup[away_team][S][i]['assist'];
                    assist_a_s = `
        <div class="assist">
      <svg xmlns="http://www.w3.org/2000/svg" width="11.192" height="5.134" viewBox="0 0 11.192 5.134"><path id="Path_54488" data-name="Path 54488" d="M69,27.416l.011.021c-.047.031-.073.093-.109.137a1.606,1.606,0,0,1-.229.231,1.916,1.916,0,0,1-1.245.423,2.774,2.774,0,0,1-.971-.193,1.456,1.456,0,0,0-.929-.241,1.184,1.184,0,0,0-.454.318v.011l.074.074c.034.183.315.294.333.485a.145.145,0,0,1-.228.118.716.716,0,0,1-.119-.137,3.523,3.523,0,0,1-.282-.361l-.306.166-.718.373a1.765,1.765,0,0,0,.18.336.434.434,0,0,1,.1.234.142.142,0,0,1-.25.08.773.773,0,0,1-.11-.185,2.173,2.173,0,0,1-.187-.338,7.707,7.707,0,0,0-.834.313c-.261.1-.534.16-.8.236a2.183,2.183,0,0,1-.58.158,1.418,1.418,0,0,1-.506.132,6.951,6.951,0,0,0-.76.223,1.289,1.289,0,0,0-.378.182.9.9,0,0,0-.245.794c0,.111-.027.248.057.335a.334.334,0,0,0,.165.066,2.317,2.317,0,0,0,.412.105l.063.338c.058.075.024.2.1.269a.213.213,0,0,0,.155.048c.135,0,.372.045.484-.041.055-.042.046-.11.086-.16l.053-.285.749.084.032.19c.048.059.034.132.106.18a.382.382,0,0,0,.222.031.757.757,0,0,0,.485-.084l.011-.032.042-.243,2.575-.032,1.963-.084a.831.831,0,0,0,.118.419c.113.109.38.056.525.056a.236.236,0,0,0,.168-.047c.115-.1.052-.3.138-.406l-.011-.042a2.984,2.984,0,0,1,.338-.02.253.253,0,0,1,.134.01c.036.024.037.088.045.126a.849.849,0,0,0,.092.306c.091.129.362.074.5.074a.313.313,0,0,0,.169-.024c.077-.046.068-.115.116-.176,0-.067.032-.3.089-.337.04-.027.117-.008.164-.011a.714.714,0,0,0,.433-.1l-.011-.032c.035-.029.039-.094.048-.137a1,1,0,0,1,.1-.369l.011-.042.08-.38.047-.158a2.387,2.387,0,0,1,.092-.538,4.543,4.543,0,0,0,.035-.981c-.119.084-.222.191-.339.279a7.268,7.268,0,0,1-.854.542c-.581.323-1.226.5-1.825.788a3.1,3.1,0,0,0-.674.415c-.08.067-.164.221-.256.26a1.365,1.365,0,0,1-.389.028c-.315.026-.632.059-.95.073a1.281,1.281,0,0,1,.326-.308,3.452,3.452,0,0,1,.74-.428,8.054,8.054,0,0,1,.938-.284A12.859,12.859,0,0,0,69.34,29.5a5.549,5.549,0,0,0,.96-.566c.089-.068.269-.172.3-.286.025-.093-.076-.2-.088-.3a1.871,1.871,0,0,0-.34.238,3.855,3.855,0,0,1-.442.274,14.181,14.181,0,0,1-1.6.684,5.433,5.433,0,0,1-.674.189c-.07.018-.218.026-.264.083a.512.512,0,0,0-.19.042c-.141.038-.281.084-.422.122a5.149,5.149,0,0,0-1.794.782,2.452,2.452,0,0,0-.356.32c-.058.066-.124.189-.2.228a.481.481,0,0,1-.189.015c-.081,0-.16.02-.243.021-.26,0-.52.021-.781.021a1.7,1.7,0,0,1,.485-.529,4.991,4.991,0,0,1,1.614-.877c.4-.136.822-.184,1.234-.281a13.847,13.847,0,0,0,2.872-.86,5.15,5.15,0,0,0,1.192-.713,4.178,4.178,0,0,0-.647-.87c-.1-.1-.261-.231-.416-.191-.2.051-.211.245-.341.365m-3.335.116a1.719,1.719,0,0,1,.844.25,2.269,2.269,0,0,0,.844.183,1.414,1.414,0,0,0-.229-.274c-.185-.213-.4-.587-.71-.6a.891.891,0,0,0-.539.268A1.44,1.44,0,0,0,65.667,27.532Z" transform="translate(-59.458 -27.044)" fill="#fff"></path><svg>
            ${assist > 1 ? `<i>${assist}</i>` : ``}
        </div>
    `;
                }

                away_s.append(' <div class="col-3 d-inline-flex justify-content-center">\n' +
                    '<div class="lineup-player-item '+player_performance+'" player_id="' + response.lineup[away_team][S][i]['player']['row_id'] + '">\n' +
                    '                                                <a target="_blank" href="' + response.lineup[away_team][S][i]['player']['link'] + '" class="image-wrapper">\n' +
                    '                                                    <div class="img"><img src="' + response.lineup[away_team][S][i]['player']['image'] + '"></div>\n' +
                    '                                                    <span class="'+captain_a_s+'">' + response.lineup[away_team][S][i]['player']['player_number'] + '</span>\n' +
                    '                                                    ' +rating_a_s+ yellow_a_s + red_a_s + goal_a_s + xgoal_a_s + change_a_s + star_a_s + assist_a_s +
                    '                                                </a>\n' +
                    '                                                <div class="player-name">\n' +
                    '                                                    <h3>' + response.lineup[away_team][S][i]['player']['title'] + '</h3>\n' +
                    '                                                </div>\n' +
                    '                                           </div> ' +
                    '                                        </div>');
            }


        }


        if(response.lineup_injureds){

            function renderMissed(teamId, container, titleSelector) {

                const teamData = response.lineup_injureds[teamId];
                if (!teamData) return;

                $(titleSelector).show();

                let html = '';

                $.each(teamData, function (index, value) {

                    const player = value.player;

                    html += `
        <div class="inline-player-item absent">
            <a target="_blank" href="${player.link}" class="player">
                <div class="img">
                    <img src="${player.image}" />
                </div>
                <div class="text">
                    <h5>${player.title}</h5>
                </div>
            </a>
            <div class="reason">
                <span>${value.type_name}</span>
                ${card_type(value.type)}
            </div>
        </div>
        `;
                });

                $(container).append(html);
            }

            renderMissed(home_team, '#miss_players_h', '#miss_players_h_name');
            renderMissed(away_team, '#miss_players_a', '#miss_players_a_name');
        }

        if (response.substitutions){;

            function renderSubs_team(teamId, container, titleSelector) {

                const teamData = response.substitutions[teamId];
                if (!teamData || !teamData.sub || !teamData.sub.length) return;

                if (teamData.sub[0].player_lineup != null) {
                    $(titleSelector).show();
                }

                let html = '';

                $.each(teamData.sub, function (index, value) {

                    if (value.player_lineup == null) return;

                    const sub_plus = value.substitute_plus ? '+' + value.substitute_plus : '';
                    const type_color = rating_c(value.rating);

                    html += `
        <div class="inline-player-item exchange">
            <a target="_blank" href="${value.player_lineup.link || value.player_lineup.image}" class="player out">
                <div class="img">
                    <img src="${value.player_lineup.image}" />
                </div>
                <div class="text">
                    <h5>${value.player_lineup.title}</h5>
                </div>
            </a>

            <div class="exchange-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20.621" viewBox="0 0 32 20.621">
                    <path d="M7.177,29.8a1.311,1.311,0,0,0-1.853,1.853l1.823,1.823H-8.75A1.25,1.25,0,0,0-10,34.728a1.25,1.25,0,0,0,1.25,1.25h15.9L5.323,37.8a1.311,1.311,0,1,0,1.853,1.853l4.75-4.75a.25.25,0,0,0,0-.354Z" transform="translate(20 -29.417)" fill="#fc4d4d"/>
                    <path d="M7.177,29.8a1.311,1.311,0,0,0-1.853,1.853l1.823,1.823H-8.75A1.25,1.25,0,0,0-10,34.728a1.25,1.25,0,0,0,1.25,1.25h15.9L5.323,37.8a1.311,1.311,0,1,0,1.853,1.853l4.75-4.75a.25.25,0,0,0,0-.354Z" transform="translate(12 50.039) rotate(180)" fill="#5bd286"/>
                </svg>
                <span>${value.substitute_time}’ ${sub_plus}</span>
            </div>

            <a target="_blank" href="${value.player.link}" class="player in">
                <div class="img">
                    <img src="${value.player.image}" />
                </div>
             <div class="text">
    <h5>${value.player.title}</h5>
    ${value.rating != null
                        ? `<span class="${type_color}">${value.rating}</span>`
                        : ''}
</div>
            </a>
        </div>
        `;
                });

                $(container).append(html);
            }

            renderSubs_team(home_team, '#home_sub_h', '#home_sub_h_name');
            renderSubs_team(away_team, '#home_sub_a', '#home_sub_a_name');


            function renderBench(teamId, container, titleSelector) {

                const teamData = response.substitutions[teamId];
                if (!teamData || !teamData.sub) return;

                $(titleSelector).show();

                let html = '';

                $.each(teamData.sub, function (index, value) {

                    const player = value.player;

                    html += `
        <div class="col-6 col-md-4">
            <div class="inline-player-item">
                <a target="_blank" href="${player.link}" class="player">
                    <div class="img">
                        <img src="${player.image}">
                        <span class="number">${player.player_number}</span>
                    </div>
                    <div class="text">
                        <h5>${player.title}</h5>
                        <span>${player.position}</span>
                    </div>
                </a>
            </div>
        </div>
        `;
                });

                $(container).append(html);
            }

            renderBench(home_team, '#sub_players_h', '#sub_players_h_name');
            renderBench(away_team, '#sub_players_a', '#sub_players_a_name');
        }
    }

}

let touchedOnceId = null;
let lastTouchTime = 0;

function showPlayerTooltip($element) {
    // Per-page opt-out (set window.__DISABLE_LINEUP_TOOLTIP__ = true in the view to skip).
    if (window.__DISABLE_LINEUP_TOOLTIP__) return;

    const player_id = $element.attr('player_id');

    $element.siblings('.tooltip_c').remove();

    const $loadingTooltip = $('<div class="tooltip_c"></div>').html('<img src="../../../../../images/three-dots.svg" />');
    $element.after($loadingTooltip);

    $.ajax({
        url: match_link + "get_player_performance",
        type: "get",
        dataType: "json",
        data: {
            match_code,
            player_id,
        },
        success: function (response) {
            $loadingTooltip.remove();

            if (response.status === 1) {
                if (response.player_st.length>0) {
                let tooltipContent = "";

                response.player_st.forEach(stat => {
                    tooltipContent += `<p><strong>${stat.statistic_name} :</strong> <span class='stat-goal'>${stat.value}</span></p>`;
                });

                const $tooltip = $('<div class="tooltip_c"></div>').html(tooltipContent);
                $element.after($tooltip.hide().fadeIn());
            }
            }
        }
    });
}

function hideAllTooltips() {
    $('.tooltip_c').fadeOut(function () {
        $(this).remove();
    });
}

 $(document).on('mouseenter', '.player_performance', function () {
    if (!isMobile()) {
        showPlayerTooltip($(this));
    }
}).on('mouseleave', '.player_performance', function () {
    if (!isMobile()) {
        hideAllTooltips();
    }
});

 $(document).on('touchstart', '.player_performance', function (e) {
    if (window.__DISABLE_LINEUP_TOOLTIP__) return;
    if (!isMobile()) return;

    const $player = $(this);
    const player_id = $player.attr('player_id');
    const now = Date.now();

    if (touchedOnceId !== player_id || now - lastTouchTime > 3000) {
        e.preventDefault(); // block link navigation
        e.stopPropagation();

        touchedOnceId = player_id;
        lastTouchTime = now;

        hideAllTooltips();
        showPlayerTooltip($player);
    } else {
         touchedOnceId = null;
    }
});

 $(document).on('click', '.player_performance a', function (e) {
    if (window.__DISABLE_LINEUP_TOOLTIP__) return;
    if (isMobile() && touchedOnceId) {
        e.preventDefault(); // prevent first-tap link
    }
});

// Tapping outside resets the touched player
$(document).on('touchstart', function (e) {
    if (isMobile() && !$(e.target).closest('.player_performance, .tooltip_c').length) {
        hideAllTooltips();
        touchedOnceId = null;
    }
});

function isMobile() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}



function rating_c(rating){
    var type_color ,number_rating =parseInt(rating, 10);
    if(number_rating===6){
         type_color='rate C';
    }else if(number_rating===5){
        type_color='rate D';
    }else if(number_rating===1 || number_rating===2 || number_rating===3 || number_rating===4){
        type_color='rate F';
    }else if(number_rating===7){
        type_color='rate A';
    }else if(number_rating===8 || number_rating===9){
        type_color='rate B';
    }else if(number_rating===10){
        type_color='rate AA';
    }
    return type_color;
}


function card_type(type){
    var type_icon='<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">\n' +
        '                                        <path id="Combined_Shape" data-name="Combined Shape" d="M2.929,17.071A10,10,0,1,1,17.071,2.929,10,10,0,1,1,2.929,17.071ZM1.818,10A8.182,8.182,0,1,0,10,1.818,8.191,8.191,0,0,0,1.818,10Zm7.54,3.37a.909.909,0,1,1,.642.266A.909.909,0,0,1,9.358,13.37ZM9.091,10V6.364a.909.909,0,0,1,1.818,0V10a.909.909,0,0,1-1.818,0Z" transform="translate(0 0)" fill="#707488"></path>\n' +
        '                                    </svg>';
    if(type===1){

        type_icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\">\n" +
            "                                        <circle id=\"Ellipse_268\" data-name=\"Ellipse 268\" cx=\"10\" cy=\"10\" r=\"10\" fill=\"#fc4d4d\"></circle>\n" +
            "                                        <path id=\"Path_53330\" data-name=\"Path 53330\" d=\"M135.731,142.092h-3.787V138.3h-2.727v3.787H125.43v2.727h3.787v3.787h2.727v-3.787h3.787Z\" transform=\"translate(-120.58 -133.305)\" fill=\"#fff\"></path>\n" +
            "                                    </svg>";
    }else if(type===2){

        type_icon="<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"23.582\" height=\"24.833\" viewBox=\"0 0 23.582 24.833\">\n" +
            "                                        <defs>\n" +
            "                                            <filter id=\"Path_14774\" x=\"6.499\" y=\"0\" width=\"17.082\" height=\"23.334\" filterUnits=\"userSpaceOnUse\">\n" +
            "                                                <feOffset dx=\"-2\" dy=\"2\" input=\"SourceAlpha\"></feOffset>\n" +
            "                                                <feGaussianBlur result=\"blur\"></feGaussianBlur>\n" +
            "                                                <feFlood flood-opacity=\"0.302\"></feFlood>\n" +
            "                                                <feComposite operator=\"in\" in2=\"blur\"></feComposite>\n" +
            "                                                <feComposite in=\"SourceGraphic\"></feComposite>\n" +
            "                                            </filter>\n" +
            "                                        </defs>\n" +
            "                                        <path id=\"Path_14773\" data-name=\"Path 14773\" d=\"M-175.26-49.855l-8.208.858a1.94,1.94,0,0,1-2.138-1.813l-.992-16.453a1.94,1.94,0,0,1,1.936-2.056h10.2a1.94,1.94,0,0,1,1.936,2.064l-1,15.6A1.94,1.94,0,0,1-175.26-49.855Z\" transform=\"translate(186.602 73.819)\" fill=\"#ffda46\"></path>\n" +
            "                                        <g transform=\"matrix(1, 0, 0, 1, 0, 0)\" filter=\"url(#Path_14774)\">\n" +
            "                                            <path id=\"Path_14774-2\" data-name=\"Path 14774\" d=\"M-175.26-49.855l-8.208.858a1.94,1.94,0,0,1-2.138-1.813l-.992-16.453a1.94,1.94,0,0,1,1.936-2.056h10.2a1.94,1.94,0,0,1,1.936,2.064l-1,15.6A1.94,1.94,0,0,1-175.26-49.855Z\" transform=\"translate(195.6 69.82)\" fill=\"#ffda46\" stroke=\"rgba(0,0,0,0)\" stroke-width=\"1\"></path>\n" +
            "                                        </g>\n" +
            "                                    </svg>";

    }else if(type===3){

        type_icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"13.083\" height=\"18.447\" viewBox=\"0 0 13.083 18.447\">\n" +
            "                                                            <path id=\"Path_53340\" data-name=\"Path 53340\" d=\"M-176.87-52.618l-7.043.736a1.664,1.664,0,0,1-1.834-1.555l-.851-14.117a1.664,1.664,0,0,1,1.661-1.764h8.753a1.665,1.665,0,0,1,1.661,1.771l-.859,13.381A1.664,1.664,0,0,1-176.87-52.618Z\" transform=\"translate(187.102 69.819)\" fill=\"#fc4d4d\" stroke=\"rgba(0,0,0,0)\" stroke-width=\"1\"></path>\n" +
            "                                                        </svg>";

    }else if(type===4){

        type_icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\">\n" +
            "  <g id=\"Group_1574\" data-name=\"Group 1574\" transform=\"translate(-40 -1215)\">\n" +
            "    <circle id=\"Ellipse_268\" data-name=\"Ellipse 268\" cx=\"10\" cy=\"10\" r=\"10\" transform=\"translate(40 1215)\" fill=\"#fc4d4d\"/>\n" +
            "    <path id=\"Path_53516\" data-name=\"Path 53516\" d=\"M15.916,9.094v.062a1.094,1.094,0,0,0-1.458,1.031v.427A1.094,1.094,0,0,0,13,11.645v4.2a3.818,3.818,0,0,0,7.07,2l2.09-3.4A1.1,1.1,0,0,0,20.367,13.2l-.806,1.022V10.187A1.094,1.094,0,0,0,18.1,9.156V9.094a1.094,1.094,0,0,0-2.187,0Z\" transform=\"translate(32.667 1210.821)\" fill=\"#fff\" fill-rule=\"evenodd\"/>\n" +
            "  </g>\n" +
            "</svg>";

    }else if(type===5){

        type_icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16.242\" height=\"22.333\" viewBox=\"0 0 16.242 22.333\">\n" +
            "  <path id=\"Layer_73\" data-name=\"Layer 73\" d=\"M16.182,8.106a3.045,3.045,0,0,1-3.045-3.045V1H7.045A3.045,3.045,0,0,0,4,4.045V20.288a3.045,3.045,0,0,0,3.045,3.045H17.2a3.045,3.045,0,0,0,3.045-3.045V8.106Zm-1.188,5.076-2.873,2.873a1.017,1.017,0,0,1-1.431,0L9.248,14.613a1.016,1.016,0,1,1,1.442-1.431l.711.721,2.152-2.152a1.016,1.016,0,1,1,1.442,1.431Zm.173-8.121V1.112a3.045,3.045,0,0,1,1.35.792l2.842,2.863a3.045,3.045,0,0,1,.761,1.31H16.182A1.015,1.015,0,0,1,15.167,5.061Z\" transform=\"translate(-4 -1)\" fill=\"#39dbbf\"/>\n" +
            "</svg>";

    }else if(type===6){

        type_icon="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22.995\" height=\"23\" viewBox=\"0 0 22.995 23\">\n" +
            "  <path id=\"umbrella\" d=\"M49.671,45.143Zm-12.321,0Zm6.972-12.28v-.041a.821.821,0,1,0-1.643,0v.036A11.4,11.4,0,0,0,32,44.224c0,.185.01.729.021.914a2.9,2.9,0,0,1,2.654-2.654,2.672,2.672,0,0,1,2.675,2.654,2.672,2.672,0,0,1,2.675-2.654,2.637,2.637,0,0,1,2.654,2.336v6.895a1.617,1.617,0,1,1-3.234,0,.821.821,0,0,0-1.643,0,3.26,3.26,0,1,0,6.52,0V44.768A2.336,2.336,0,0,1,47,42.489a2.672,2.672,0,0,1,2.675,2.654,2.672,2.672,0,0,1,2.675-2.654,3.041,3.041,0,0,1,2.639,2.654c.005-.144.01-.467.01-.606A11.694,11.694,0,0,0,44.321,32.862Z\" transform=\"translate(-32 -32)\" fill=\"#5a83ff\"/>\n" +
            "</svg>";
    }else if(type===7) {
        type_icon = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\">\n" +
            "  <path id=\"download_12_\" data-name=\"download (12)\" d=\"M31.378,965.361a4.08,4.08,0,0,0-2.7,1.351c-1.384,1.246-2.744,2.642-4.054,4.054L13.811,968.6,13,970.226l8.108,4.054-4.595,5.405c-1.054-.346-2.7-.741-2.7.541a1.358,1.358,0,0,0,.27.811l3.243,3.243a1.356,1.356,0,0,0,.811.27c1.281,0,.887-1.649.541-2.7l5.405-4.595,4.054,8.108,1.622-.811L27.594,973.74c1.412-1.31,2.808-2.67,4.054-4.054a4.077,4.077,0,0,0,1.351-2.7,1.519,1.519,0,0,0-1.622-1.622Z\" transform=\"translate(-13 -965.361)\" fill=\"#7c569a\"/>\n" +
            "</svg>";
    }else if(type===8) {
        type_icon = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\">\n" +
            "                                        <circle id=\"Ellipse_268\" data-name=\"Ellipse 268\" cx=\"10\" cy=\"10\" r=\"10\" fill=\"#ce4186\"></circle>\n" +
            "                                        <path id=\"Path_53330\" data-name=\"Path 53330\" d=\"M135.731,142.092h-3.787V138.3h-2.727v3.787H125.43v2.727h3.787v3.787h2.727v-3.787h3.787Z\" transform=\"translate(-120.58 -133.305)\" fill=\"#fff\"></path>\n" +
            "                                    </svg>";
    }

    return type_icon;
}

