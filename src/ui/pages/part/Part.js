import React from 'react';
import EamlightToolbar from './../../components/EamlightToolbar';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import Grid from '@material-ui/core/Grid';
import WSParts from '../../../tools/WSParts';
import PartGeneral from "./PartGeneral";
import UserDefinedFields from "../../components/userdefinedfields/UserDefinedFields";
import PartStock from "./PartStock";
import CommentsContainer from 'eam-components/dist/ui/components/comments/CommentsContainer';
import CustomFields from '../../components/customfields/CustomFields';
import EDMSWidgetContainer from 'eam-components/dist/ui/components/edms/EDMSWidgetContainer';
import PartWhereUsed from "./PartWhereUsed";
import Entity from '../Entity';
import PartTools from "./PartTools";
import {PartIcon} from 'eam-components/dist/ui/components/icons'
import PartToolbar from "./PartToolbar";

const PART = 'PART';
const SSPART = 'SSPART';

class Part extends Entity {

    constructor(props) {
        super(props)
        this.props.setLayoutProperty('showEqpTreeButton', false)
    }

    //
    // SETTINGS OBJECT USED BY ENTITY CLASS
    //
    settings = {
        entity: 'part',
        entityDesc: 'Part',
        entityURL: '/part/',
        entityCodeProperty: 'code',
        entityScreen: this.props.userData.screens[this.props.userData.partScreen],
        renderEntity: this.renderPart.bind(this),
        readEntity: WSParts.getPart.bind(WSParts),
        updateEntity: WSParts.updatePart.bind(WSParts),
        createEntity: WSParts.createPart.bind(WSParts),
        deleteEntity: WSParts.deletePart.bind(WSParts),
        initNewEntity: () => WSParts.initPart(PART, SSPART, this.props.userData.screens[this.props.userData.partScreen].screenCode, this.props.location.search)
    };

    //
    // CALLBACKS FOR ENTITY CLASS
    //
    postInit() {
        this.setTrackingMethods();
        this.initPartToolbar()
    }

    postCreate() {
        this.comments.wrappedInstance.createCommentForNewEntity();
        this.initPartToolbar()
    }

    postUpdate() {
        this.comments.wrappedInstance.createCommentForNewEntity();
        this.initPartToolbar()
    }

    postRead(part) {
        this.initPartToolbar()
    }

    //
    // DROP DOWN VALUES
    //
    setTrackingMethods = () => {
        WSParts.getPartTrackingMethods().then(response => {
            this.setLayout({trackingMethods: response.body.data});
        }).catch(error => {
            this.props.handleError(error);
            this.setLayout({blocking: false});
        });
    };

    initPartToolbar() {
        this.setState((prevState) => ({
            partToolbar: new PartToolbar(this.state.part,
                                         this.postInit.bind(this),
                                         this.setLayout.bind(this),
                                         prevState.layout.newEntity,
                                         this.props.applicationData,
                                         this.props.userData.screens[this.props.userData.partScreen].screenCode,
                                         this.props.handleError,
                                         this.props.showNotification,
                                         this.props.showError)
        }))
    }

    //
    //
    //
    getRegions = () => {
        let user = this.props.userData.eamAccount.userCode
        let screen = this.props.userData.screens[this.props.userData.partScreen].screenCode
        return {
            PARTSTOCK: {label: "Part Stock", code: user + "_" + screen+ "_PARTSTOCK"},
            WHEREUSED: {label: "Where Used", code: user + "_" + screen+ "_WHEREUSED"},
            USERDEFFIELDS: {label: "User Defined Fields", code: user + "_" + screen+ "_USERDEFFIELDS"},
            EDMSDOCS: {label: "EDMS Documents", code: user + "_" + screen+ "_EDMSDOCS"},
            COMMENTS: {label: "Comments", code: user + "_" + screen+ "_COMMENTS"},
            CUSTOMFIELDS: {label: "Custom Fields", code: user + "_" + screen+ "_CUSTOMFIELDS"}
        }
    }

    //
    //
    //
    renderPart() {
        let props = {
            part: this.state.part,
            userData: this.props.userData,
            updatePartProperty: this.updateEntityProperty.bind(this),
            layout: this.state.layout,
            partLayout: this.props.partLayout,
            children: this.children
        };

        //Normal part screen
        return (
            <div className="entityContainer">
                <BlockUi tag="div" blocking={this.state.layout.blocking} style={{height: "100%", width: '100%'}}>

                    <EamlightToolbar isModified={this.state.layout.isModified}
                                     newEntity={this.state.layout.newEntity}
                                     entityScreen={this.props.userData.screens[this.props.userData.partScreen]}
                                     entityName={this.settings.entityDesc}
                                     entityKeyCode={this.state.part.code}
                                     saveHandler={this.saveHandler.bind(this)}
                                     newHandler={() => this.props.history.push('/part')}
                                     deleteHandler={this.deleteEntity.bind(this, this.state.part.code)}
                                     entityToolbar={this.state.partToolbar}
                                     width={730}
                                     entityIcon={<PartIcon style={{height: 18}}/>}
                                     toggleHiddenRegion={this.props.toggleHiddenRegion}
                                     regions={this.getRegions()}
                                     hiddenRegions={this.props.hiddenRegions}/>


                    <div className="entityMain">
                        <Grid container spacing={8}>
                            <Grid item sm={6} xs={12}>
                                <PartGeneral {...props}/>

                                {!this.props.hiddenRegions[this.getRegions().USERDEFFIELDS.code] &&
                                <UserDefinedFields fields={this.state.part.userDefinedFields}
                                                   entityLayout={this.props.partLayout.fields}
                                                   updateUDFProperty={this.updateEntityProperty}
                                                   children={this.children}/>
                                }

                                {!this.props.hiddenRegions[this.getRegions().PARTSTOCK.code] &&
                                 !this.state.layout.newEntity &&
                                <PartStock {...props}/>
                                }

                                {!this.props.hiddenRegions[this.getRegions().WHEREUSED.code] &&
                                  PartTools.isRegionAvailable('EPA', props.partLayout) &&
                                 !this.state.layout.newEntity &&
                                <PartWhereUsed {...props}/>}
                            </Grid>
                            <Grid item sm={6} xs={12}>

                                {!this.props.hiddenRegions[this.getRegions().EDMSDOCS.code] &&
                                 !this.state.layout.newEntity &&
                                <EDMSWidgetContainer objectID={this.state.part.code} objectType={PART}
                                                     edmsDocListLink={this.props.edmsDocListLink}/>}

                                {!this.props.hiddenRegions[this.getRegions().COMMENTS.code] &&
                                <CommentsContainer ref={comments => this.comments = comments}
                                                   entityCode={PART}
                                                   entityKeyCode={!this.state.layout.newEntity ? this.state.part.code : undefined}
                                                   userDesc={this.props.userData.eamAccount.userDesc}/>
                                }

                                {!this.props.hiddenRegions[this.getRegions().CUSTOMFIELDS.code] &&
                                  PartTools.isRegionAvailable('CUSTOM_FIELDS', props.partLayout) &&
                                <CustomFields entityCode={PART}
                                              entityKeyCode={this.state.part.code}
                                              classCode={this.state.part.classCode}
                                              customFields={this.state.part.customField}
                                              updateEntityProperty={this.updateEntityProperty}/>}

                            </Grid>
                        </Grid>
                    </div>
                </BlockUi>
            </div>
        );
    }
}

export default Part;