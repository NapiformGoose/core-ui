const requireCode = require.context('babel-loader!../cases', true);
const requireText = require.context('raw-loader!../cases', true);

import template from 'text-loader!../templates/content.html';
import Prism from 'prism';
import markdown from 'markdown';

export default Marionette.View.extend({
    className: 'demo-content_wrapper',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            description: markdown.toHTML(this.model.get('description') || '')
        };
    },

    regions: {
        caseRepresentationRegion: '.js-case-representation-region',
        attributesConfigurationRegion: '.js-attributes-configuration-region'
    },

    ui: {
        code: '.js-code'
    },

    onRender() {
        Prism.highlightElement(this.ui.code[0]);
        let path;
        if (this.model.id) {
            path = `${this.model.get('sectionId')}/${this.model.get('groupId')}/${this.model.id}`;
        } else {
            path = `${this.model.get('sectionId')}/${this.model.get('groupId')}`;
        }

        const code = requireCode(`./${path}`).default;
        const text = requireText(`./${path}`);

        this.ui.code.text(text);
        this.model.set('sourceCode', text);
        const representationView = code();
        this.showChildView('caseRepresentationRegion', representationView);

        const attributesConfig = this.model.get('attributesConfig');

        if (attributesConfig) {
            this.showChildView('attributesConfigurationRegion', this.__createAttributesConfigurationView(attributesConfig));
        }
    },

    __createAttributesConfigurationView(attributesConfig) {
        const columns = [
            {
                key: 'attribute',
                type: 'String',
                title: 'Attribute',
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell')
            },
            {
                key: 'values',
                type: 'String',
                title: 'Possible values',
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'textCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Desc, 'textCell')
            },
            {
                key: 'default',
                type: 'String',
                title: 'Default value',
                sortAsc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Asc, 'numberCell'),
                sortDesc: core.utils.helpers.comparatorFor(core.utils.comparators.numberComparator2Desc, 'numberCell')
            }
        ];

        const gridController = new core.list.controllers.GridController({
            columns,
            collection: new Backbone.Collection(attributesConfig)
        });

        return gridController.view;
    }
});
