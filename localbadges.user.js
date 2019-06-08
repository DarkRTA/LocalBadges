// ==UserScript==
// @name			LocalBadges
// @description		FrankerFaceZ addon that allows badges to be assigned to users locally.
// @version			2019-06-08
// @author			Dark
// @released		2018-06-08
// @updated			2019-06-08
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
        script.src = "https://theessenceofdarkness.github.io/LocalBadges/dist/localbadges.js";
	
        document.head.appendChild(script)
    } else {
        attempts = (attempts || 0) + 1;
        if (attempts < 60)
            return setTimeout(load_localbadges.bind(this, attempts), 1000);
        console.log('[Local Badges] Could not find FFZ. Injection unsuccessful.');
    }
}

load_localbadges();
