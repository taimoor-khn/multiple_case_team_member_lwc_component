import { LightningElement, track, api, wire } from 'lwc';
import getCaseTeamRole from "@salesforce/apex/AddCaseTeamMembersController.getCaseTeamRole";
import searchContactsByName from "@salesforce/apex/AddCaseTeamMembersController.searchContactsByName";
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class CaseTeamComp extends LightningElement {
    @track visbleIndex;
    @track isModalOpen = true;
    @track keyIndex = 0;
    @track itemList = [
        {
            id: 0,
            parentId: '',
            memberId: '',
            teamRoleId: '',
            user: true,
            contact: false,
            iconName: 'standard:avatar'
        }
    ];

    @api recordId;
    @track teamRoles
    @track arr = [];
    @track value;
    @wire(getCaseTeamRole) wiredAccounts({ data, error }) {
        if (data) {
            console.log(data);
            this.teamRoles = data.map(d => {
                return { label: d.Name, value: d.Id };
            });
        } else if (error) {
            console.log(error);
        }
    }
    handleChange(event) {
        this.itemList[event.currentTarget.dataset.index].teamRoleId = event.target.value;
        this.itemList[event.currentTarget.dataset.index].parentId = this.recordId;
    }

    get options() {
        return [
            { label: 'User', value: 'User', iconName: 'standard:account' },
            { label: 'Contact', value: 'Contact', iconName: 'standard:account' },
        ];
    }
    @track showContact = false;
    @track showUser = true;
    handleChoice(event) {
        console.log('event.currentTarget.dataset.comb' + event.currentTarget.dataset.comb);
        console.log('event.detail.name' + event.detail.label)
        console.log('event.detail.value' + event.detail.value)
        if (event.detail.value === 'User') {
            this.itemList[event.currentTarget.dataset.comb].iconName = 'standard:avatar';
            this.itemList[event.currentTarget.dataset.comb].user = true;
            this.itemList[event.currentTarget.dataset.comb].contact = false;
        }
        if (event.detail.value === 'Contact') {
            this.itemList[event.currentTarget.dataset.comb].iconName = 'standard:person_name';
            this.itemList[event.currentTarget.dataset.comb].user = false;
            this.itemList[event.currentTarget.dataset.comb].contact = true;
        }
    }

    valuesEqual(_index) {
        return this.visbleIndex === this._index;
    }
    contactDetail(event) {
        this.itemList[event.currentTarget.dataset.contact].memberId = event.target.value;
    }
    userDetail(event) {

        this.itemList[event.currentTarget.dataset.user].memberId = event.target.value;
    }
    @track isLoaded = false;
    @track completed = true;
    handleCreateRecord() {
        this.isLoaded = true;
        this.completed = true;
        for (let acc of this.itemList) {
            console.log(acc.memberId + '+' + acc.teamRoleId + '+' + acc.parentId)
            if (acc.memberId === '' || acc.teamRoleId === '' || acc.parentId == '') {
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: 'Incomplete Fields',
                    variant: 'error',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
                this.isLoaded = false;
                this.completed = false;
                break;
            }
        }
        if (this.completed) {
            this.callinApexFunction();
        }

    }

    callinApexFunction() {
        searchContactsByName({ lstring: this.itemList }).then((result) => {

            this.isLoaded = false;
            const evt = new ShowToastEvent({
                title: 'Inserted',
                message: result,
                variant: 'success',
            });
            this.dispatchEvent(evt);
            this.itemList = [];
            if (this.itemList.length == 0) {
                this.addRow();
            }
        })
            .catch((error) => {
                // Handle any errors from the server
                this.isLoaded = false;
                const evt = new ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);

            });
    }

    addRow() {
        let objRow = {
            id: ++this.keyIndex,
            parentId: '',
            memberId: '',
            teamRoleId: '',
            user: true,
            contact: false,
            iconName: 'standard:avatar'
        }
        this.itemList = [...this.itemList, objRow];
    }

    removeRow(event) {

        if (this.itemList.length >= 2) {
            this.itemList = this.itemList.filter(function (element) {
                return parseInt(element.id) !== parseInt(event.currentTarget.dataset.index);
            });
        }
    }
    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}


