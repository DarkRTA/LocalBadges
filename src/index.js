const DEFAULT_BADGES = '[{"title":"Example Badge","color":"#6441a4","image":"https://darkrta.github.io/LocalBadges/res/subscriber.svg","slot":9,"users":["kappa","twitch"]}]'
const DEFAULT_USERS = '[{"nick":"darkrta","badges":[{"title":"LocalBadges Developer","color":"#3f3f3f","image":"https://darkrta.github.io/LocalBadges/res/addon-badge.png","slot":12}]}]'

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
		this.settings.addUI('localbadges.badges', {
			default: DEFAULT_BADGES,
			key: 'localbadges.badges',
			path: 'Add-Ons > Local Badges > Custom Badges',
			title: 'Custom Badges',
			description: 'Define your custom badges here',
			component: 'localbadges-ui',
			schema: require("./schema/badges.json"),
		});

		this.settings.addUI('localbadges.users', {
			default: DEFAULT_USERS,

			key: 'localbadges.users',
			path: 'Add-Ons > Local Badges > User Specific Badges',
			title: 'User Specific Badges',
			description: 'Define badges that are specific to users here. Note: This is a hack so expect some bugs.',
			component: 'localbadges-ui',
			schema: require("./schema/users.json"),
		});

		// this css hack is only needed to work around some limitations of ffz
		var css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML = '.ffz-badge[data-badge="addon-localbadges.user"] { background-size: contain!important }';
		document.getElementsByTagName("head")[0].appendChild(css);

		//for user specific badges
		this.badges.loadBadgeData("addon-localbadges.user", {
			title: "User Specific Badges",
			color: "#3f3f3f",
			slot: 0,
			image: "https://darkrta.github.io/LocalBadges/res/addon-icon.png",
			urls: {
				"1": "https://darkrta.github.io/LocalBadges/res/addon-icon.png",
			},
		}, false);

		this.loadBadges();

		this.settings.provider.on("changed", this.onSettingChange, this);

		this.log.info('Local Badges initialized successfully');
	}

	onSettingChange(k, v, deleted) {
		if (k === "localbadges.badges" || k === "localbadges.users") {
			this.unloadBadges();
			this.loadBadges();
		}
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
		let badges = JSON.parse(this.settings.provider.get('localbadges.badges', DEFAULT_BADGES));
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

		let users = JSON.parse(this.settings.provider.get('localbadges.users', DEFAULT_USERS));
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
	icon: "https://darkrta.github.io/LocalBadges/res/addon-icon.png",
	version: "2020-10-14",
	author: "Dark",
});

ffz.resolve("addon.dark.localbadges").enable();
