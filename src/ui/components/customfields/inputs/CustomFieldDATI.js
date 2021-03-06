import React, {Component} from 'react';
import EAMSelect from 'eam-components/dist/ui/components/muiinputs/EAMSelect'
import EAMDateTimePicker from 'eam-components/dist/ui/components/muiinputs/EAMDateTimePicker'
import tools from '../CustomFieldTools'

class CustomFieldDATI extends Component {

    render() {
        let {customField, updateCustomFieldValue, elementInfo, children} = this.props
        elementInfo = {...elementInfo, readonly: this.props.readonly};

        if (tools.isLookupCustomField(customField)) {
            return <EAMSelect
                children={children}
                elementInfo={elementInfo}
                valueKey="value"
                values={this.props.lookupValues[customField.code]}
                value={customField.value}
                updateProperty={updateCustomFieldValue}/>
        } else {
            return (
                <EAMDateTimePicker
                    children={children}
                    elementInfo={elementInfo}
                    value={customField.value}
                    updateProperty={updateCustomFieldValue}
                    valueKey="value"/>
            )
        }
    }
}

export default CustomFieldDATI;