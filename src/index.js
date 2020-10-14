class LocalBadges extends FrankerFaceZ.utilities.addon.Addon {
	constructor(...args) {
		super(...args);

		this.load_requires = ['vue'];

		this.inject('settings');
		this.inject('vue');
		this.inject('chat');
		this.inject('chat.badges');

		this.badge_uid = 0;
		this.badge_ids = [];
		this.badge_list = [];
	}

	onEnable() {
		//load the vue component
		this.vue.component("localbadges-ui", require('./components/localbadges-ui.vue').default);

		//load the settings
		this.settings.add('localbadges.badges', {
			default: '[{"title":"Example Badge","color":"#6441a4","image":"https://theessenceofdarkness.github.io/LocalBadges/res/subscriber.svg","slot":9,"users":["kappa","twitch"]}]',

			ui: {
				path: 'Add-Ons > Local Badges > Custom Badges',
				title: 'Custom Badges',
				description: 'Define your custom badges here',
				component: 'localbadges-ui',
				schema: require("./schema/badges.json"),
			}
		});

		this.settings.add('localbadges.users', {
			default: '[{"nick":"theessenceofdarkness","badges":[{"title":"LocalBadges Developer","color":"#5c9bfe","image":"https://theessenceofdarkness.github.io/LocalBadges/res/devbadge.png","slot":12}]}]',

			ui: {
				path: 'Add-Ons > Local Badges > User Specific Badges',
				title: 'User Specific Badges',
				description: 'Define badges that are specific to users here. Note: This is a hack so expect some bugs.',

				component: 'localbadges-ui',
				schema: require("./schema/users.json"),
			} 
		});

		// this css hack is only needed to work around some limitations of ffz
		var css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML = '.ffz-badge[data-badge="addon-localbadges.user"] { background-size: contain!important }';
		document.getElementsByTagName("head")[0].appendChild(css);

		//for user specific badges
		this.badges.loadBadgeData("addon-localbadges.user", {
			title: "User Specific Badges",
			color: "#5c9bfe",
			slot: 0,
			image: "https://theessenceofdarkness.github.io/LocalBadges/res/devbadge.png",
			urls: {
				"1": "https://theessenceofdarkness.github.io/LocalBadges/res/devbadge.png",
			},
		}, false);

		this.loadBadges();

		this.on("settings:changed:localbadges.badges", this.reloadBadges, this);
		this.on("settings:changed:localbadges.users", this.reloadBadges, this);

		this.log.info('Local Badges initialized successfully');
	}

	reloadBadges() {
		this.unloadBadges();
		this.loadBadges();
	}

	addBadge(user, provider, id, data) {
		this.chat.getUser(undefined, user).addBadge(provider, id, data);
		this.badge_list.push({id, user, provider});
	}

	unloadBadges() {
		for (let i of this.badge_ids) {
			//ffz does not expose an api for this so we delete it directly
			delete this.badges.badges[i];
		}
		//reqiured since we modified the badge list
		this.badges.buildBadgeCSS();
		for (let i of this.badge_list) {
			this.chat.getUser(undefined, i.user).removeBadge(i.provider, i.id);
		}

		//reset the state since we are done
		this.badge_uid = 0;
		this.badge_ids = [];
		this.badge_list = [];
	}

	loadBadges() {

		//badges
		let badges = JSON.parse(this.settings.main_context.get('localbadges.badges'));
		for (let badge of badges) {
			this.parseBadgeData(badge, false);

			this.badge_ids.push(badge.id);
			if (badge.users != undefined) {
				for (var user of badge.users) {
					this.addBadge(user, 'localbadges', badge.id);
				}
				delete badge.users;
			}

			this.badges.loadBadgeData(badge.id, badge, false);
		}

		this.badges.buildBadgeCSS();

		//user specific badges

		let users = JSON.parse(this.settings.main_context.get('localbadges.users'));
		for (var user of users) {
			for (var badge of user.badges) {	
				let uid = this.badge_uid++;
				this.parseBadgeData(badge, true);
				this.addBadge(user.nick, 'localbadges' + uid, badge.id, badge);
			}
		}
	}

	//parses the badge data and edits it in place
	parseBadgeData(data, user) {
		if (user) {
			data.id = "addon-localbadges.user"
		} else {
			if (!data.id)
				data.id = `addon-localbadges.r-${this.badge_uid++}`;
			else 
				data.id = `addon-localbadges.s-${data.id}`;
		}

		//required to prevent FFZ from screwing with the URLS
		data.urls = {};
		data.urls["1"] = data.image;
	}
}


LocalBadges.register({
	id:   "dark.localbadges",
    name: "Local Badges",
	description: "Allows you add badges to users locally.",
	settings: "add_ons.local_badges",
    version: "2019-06-08",
    author: "Dark",
});

ffz.resolve("addon.dark.localbadges").enable();
