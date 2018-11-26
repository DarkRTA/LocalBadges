// ==UserScript==
// @name			LocalBadges
// @description		FrankerFaceZ addon that allows badges to be assigned to users locally.
// @version			1.0.0
// @author			Dark
// @released		2018-10-22
// @updated			2019-06-07
// @include			http://twitch.tv/*
// @include			https://twitch.tv/*
// @include			http://*.twitch.tv/*
// @include			https://*.twitch.tv/*
// @exclude			http://api.twitch.tv/*
// @exclude			https://api.twitch.tv/*
// @grant			none
// @run-at			document-end
// ==/UserScript==


function load_localbadges(attempts) {
    if (window.FrankerFaceZ !== undefined) {
        var script = document.createElement('script');
        script.src = "http://localhost:8080/localbadges.js";
        document.head.appendChild(script)
    } else {
        attempts = (attempts || 0) + 1;
        if (attempts < 60)
            return setTimeout(load_localbadges.bind(this, attempts), 1000);
        console.log('[FFZ LocalBadges] Could not find FFZ. Injection unsuccessful.');
    }
}

load_localbadges();
