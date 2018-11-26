<template lang="html">
<div>
		<div class="tw-border-b tw-mg-b-1 tw-pd-b-1">
			<h2>{{item.title}}</h2>
			<p>{{item.description}}</p>
		</div>
		<div ref="editor"></div>
	</div>
</template>

<script>
import JSONEditor from '@json-editor/json-editor';

/*
 * Incremented every time something needs a unique id. I'm aware that this will
 * break when Number.MAX_SAFE_INTEGER is reached.
 */
let uid = 0;

JSONEditor.defaults.themes.localbadges = JSONEditor.AbstractTheme.extend({
	getButton: function(text, icon, title) {
		var el = document.createElement('button');
		el.type = 'button';
		this.setButtonText(el,text,icon,title);
		el.classList.add("tw-button");
		el.classList.add("tw-mg-x-05");
		el.classList.add("tw-pd-x-05");
		return el;
	},
	getCheckbox: function() {
		var el = this.getFormInputField('checkbox');
		el.classList.add("tw-checkbox__input");
		return el;
	},
	getCheckboxLabel: function(text) {
		var el = this.getFormInputLabel(text);
		el.classList.add("tw-checkbox__label");
		el.style.fontWeight = 'normal';
		return el;
	},	
	getChildEditorHolder: function() {
		var el = this._super();
		el.style.marginBottom = '8px';
		return el;
	},
	getFormControl: function(label, input, description, infoText) {
		var el = document.createElement('div');
		el.classList.add('tw-mg-l-1');
		el.classList.add('tw-flex');
		el.classList.add('tw-align-items-center');
		if(label) el.appendChild(label);
		if(input.type === 'checkbox' && label) {
			el.classList.add('tw-checkbox');
			el.insertBefore(input,el.firstChild);
			if(infoText) label.appendChild(infoText);
			let id = "localbadges-ui-" + uid++;
			input.id = id;
			label.htmlFor = id;
		} else {
			if(infoText) label.appendChild(infoText);
			el.appendChild(input);
		}
		if(description) el.appendChild(description);
		return el;
	},
	getFormInputField: function(type) {
		var el = document.createElement('input');
		el.setAttribute('type',type);
		el.classList.add("tw-input");
		el.classList.add("tw-pd-x-1");
		el.classList.add("tw-pd-y-05");
		el.classList.add("tw-border-radius-medium");
		return el;
	},
	getFormInputLabel: function(text) {
		var el = this._super(text);
		el.style.display = 'inline';
		return el;
	},
	getFormInputDescription: function(text) {
		var el = this._super(text);
		el.style.fontSize = '.8em';
		el.style.margin = 0;
		el.style.display = 'inline-block';
		el.style.fontStyle = 'italic';
		return el;
	},
	getGridRow: function() {
		var el = document.createElement('div');
		el.classList.add('ffz--widget');
		el.classList.add('tw-mg-b-05');
		return el;
	},
	getHeader: function(text) {
	var el = document.createElement('div');
		el.classList.add('tw-mg-l-1');
	if(typeof text === "string") {
		el.textContent = text;
	} else {
		el.appendChild(text);
	}

	return el;
	},
	getHeaderButtonHolder: function() {
		var el = this.getButtonHolder();
		el.style.display = 'inline-block';
		el.style.fontSize = 'tw-font-size-6';
		el.style.verticalAlign = 'middle';
		return el;
	},
	getIndentedPanel: function() {
		var el = this._super();
		el.classList.add("tw-border-l");
		el.classList.add("tw-pd-l-05");
		el.classList.add("tw-pd-t-05");
		el.classList.add("tw-pd-b-05");
		el.classList.add("tw-mg-l-1");
		el.classList.add("tw-mg-t-1");
		el.classList.add("tw-mg-b-1");
		return el;
	},
	getTopIndentedPanel: function() {
		return this.getIndentedPanel();
	},
	getTab: function(span, tabId) {
		var el = document.createElement('div');
		el.appendChild(span);
		el.id = tabId;
		el.style = el.style || {};
		this.applyStyles(el,{
			border: '1px solid #6441a4',
			borderWidth: '1px 0 1px 1px',
			marginBottom: '-1px',
			textAlign: 'center',
			lineHeight: '30px',
			cursor: 'pointer',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
		});
		return el;
	},
	getTopTab: function(span, tabId) {
		var el = document.createElement('div');
		el.id = tabId;
		el.appendChild(span);
		el.style = el.style || {};
		this.applyStyles(el,{
			float: 'left',
			border: '1px solid #6441a4',
			borderWidth: '1px 1px 1px 1px',
			textAlign: 'center',
			marginLeft: '-1px',
			lineHeight: '30px',
			minWidth: '50px',
			cursor: 'pointer',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
		});
		el.classList.add("tw-pd-x-05");
		return el;
	},
	getTabHolder: function(propertyName) {
		  var pName = (typeof propertyName === 'undefined')? "" : propertyName;
		  var el = document.createElement('div');
		  el.innerHTML = `
<div style='float: left; width: 130px;' class='tabs' id='${pName}'></div>
<div class='content' style='margin-left: 120px;' id='${pName}'></div>
<div style='clear:both;'></div>`;
		  return el; 
	},
	getTopTabHolder: function(propertyName) {
		var pName = (typeof propertyName === 'undefined')? "" : propertyName;
		var el = document.createElement('div');
		el.innerHTML = `
<div class='tabs' style='margin-left: 10px' id='${pName}'></div>
<div style='clear:both;'></div><div class='content' id='${pName}'></div>`;
		return el;
	},
	markTabActive: function(row) {
		this.applyStyles(row.tab,{
			background: '#6441a4',
			color: '#fff',
		});
		if(typeof row.rowPane !== 'undefined'){
			row.rowPane.style.display = '';
		} else {
			row.container.style.display = '';
		}
	},
	markTabInactive: function(row) {
		this.applyStyles(row.tab,{
			background: '',
			color: '',
		});
		if(typeof row.rowPane !== 'undefined'){
			row.rowPane.style.display = 'none';
		} else {
			row.container.style.display = 'none';
		}
	},
	getTable: function() {
		var el = this._super();
		el.classList.add("tw-mg-b-05");
		return el;
	},
	getSelectInput: function(options) {
		var select = document.createElement('select');
		if(options) this.setSelectOptions(select, options);
		select.classList.add("tw-select");
		select.classList.add("tw-border-radius-medium");
		return select;
	},
	getSwitcher: function(options) {
		var switcher = this.getSelectInput(options);
		switcher.style.display = 'inline-block';
		switcher.style.fontStyle = 'italic';
		switcher.style.fontWeight = 'normal';
		switcher.style.height = 'auto';
		switcher.style.marginBottom = 0;
		switcher.style.marginLeft = '5px';
		switcher.style.padding = '0 0 0 3px';
		switcher.style.width = 'auto';
		return switcher;
	},
	getModal: function() {
		var el = document.createElement('div');
		el.classList.add("tw-c-background-body");
		el.style.border = '1px solid black';
		el.style.position = 'absolute';
		el.style.zIndex = '10';
		el.style.display = 'none';
		return el;
	},

	addInputError: function(input, text) {
		input.style.borderColor = 'red';

		if(!input.errmsg) {
			var group = this.closest(input,'.form-control');
			input.errmsg = document.createElement('div');
			input.errmsg.setAttribute('class','errmsg');
			input.errmsg.style = input.errmsg.style || {};
			input.errmsg.style.color = 'red';
			group.appendChild(input.errmsg);
		}
		else {
			input.errmsg.style.display = 'block';
		}

		input.errmsg.innerHTML = '';
		input.errmsg.appendChild(document.createTextNode(text));
	},
	removeInputError: function(input) {
		input.style.borderColor = '';
		if(input.errmsg) input.errmsg.style.display = 'none';
	},
	getProgressBar: function() {
		var max = 100, start = 0;

		var progressBar = document.createElement('progress');
		progressBar.setAttribute('max', max);
		progressBar.setAttribute('value', start);
		return progressBar;
	},
	updateProgressBar: function(progressBar, progress) {
		if (!progressBar) return;
		progressBar.setAttribute('value', progress);
	},
	updateProgressBarUnknown: function(progressBar) {
		if (!progressBar) return;
		progressBar.removeAttribute('value');
	}
});

export default {
	mixins: [ffz.resolve('main_menu').Mixin],
	props: ['item', 'context', ''],
	
	data() {
		return {
			id: null,
		}
	},

	mounted() {
		const el = this.$refs.editor

		this.editor = new JSONEditor(el, {
			theme: "localbadges",
			schema: this.item.schema,
			startval: JSON.parse(this.value),
			collasped: true,
			disable_edit_json: true,
			disable_array_reorder: true,
			disable_array_delete_last_row: true,
			disable_array_delete_all_rows: true,
			prompt_before_delete: false,
		});
		
		this.editor.on('change', () => {
			this.set(JSON.stringify(this.editor.getValue()));
		});
	},

	beforeDestroy() {
		this.editor.destroy();
	}
}
</script>
