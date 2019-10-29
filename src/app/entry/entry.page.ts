import {Component, OnDestroy, OnInit} from '@angular/core';
import {PopoverController} from '@ionic/angular';
import {AddAmountComponent} from './components/add-amount/add-amount.component';
import {ActivatedRoute, Router} from '@angular/router';
import {IFlattenAccountsResultItem} from '../models/account.model';
import {AppState} from '../store/reducer';
import {select, Store} from '@ngrx/store';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {SelectAccountComponentComponent} from './components/select-account/select-account.component';
import {ResetEntryAction, SetEntryAction} from '../actions/entry/entry.action';
import {EntryModel, EntryTypes} from '../models/entry.model';
import {GeneralService} from '../services/general.service';

@Component({
    selector: 'app-entry',
    templateUrl: './entry.page.html',
    styleUrls: ['./entry.page.scss'],
})
export class EntryPage implements OnInit, OnDestroy {
    public salesAccounts: IFlattenAccountsResultItem[] = [];
    public expensesAccounts: IFlattenAccountsResultItem[] = [];
    public depositAccounts: IFlattenAccountsResultItem[] = [];
    public accountList: IFlattenAccountsResultItem[] = [];
    public entryType: EntryTypes;
    public requestModal: EntryModel;
    public addAmountPopover;
    public accountListPopover;

    constructor(private popoverCtrl: PopoverController, private activatedRouter: ActivatedRoute, private store: Store<AppState>,
                private router: Router, private _generalService: GeneralService) {
    }

    ngOnInit() {
    }

    ionViewWillEnter() {
        this.entryType = this.activatedRouter.snapshot.params.entryType;

        this.store.pipe(
            select(s => s.general),
            untilDestroyed(this)
        ).subscribe(res => {
            this.salesAccounts = res.salesAccounts;
            this.expensesAccounts = res.expensesAccounts;
            this.depositAccounts = res.depositAccounts;

            this.assignAccountToList();
        });

        this.store.pipe(select(s => s.entry.requestModal), untilDestroyed(this)).subscribe(req => {
            this.requestModal = {...req};
        });
    }

    ionViewDidEnter() {
        this.showAddAmountModal();
    }

    async showAddAmountModal() {
        this.addAmountPopover = await this.popoverCtrl.create({
            component: AddAmountComponent,
            animated: true,
            componentProps: {
                actionType: this.requestModal.entryType
            },
            cssClass: 'w350',
            backdropDismiss: false,
            showBackdrop: true
        });
        await this.addAmountPopover.present();

        this.addAmountPopover.onDidDismiss().then(res => {
            if (res && res.data) {
                this.requestModal.transactions[0].amount = res.data.amount;
                this.updateRequestModal();
                this.showAccountList();
            } else {
                this.goToHome();
            }
        }).catch(reason => {
            this.requestModal.transactions[0].amount = 0;
            this.updateRequestModal();
        });
    }

    async showAccountList() {
        this.accountListPopover = await this.popoverCtrl.create({
            componentProps: {
                accountList: this.accountList,
                entryType: this.entryType
            },
            component: SelectAccountComponentComponent,
            animated: true,
            backdropDismiss: false,
            cssClass: 'select-amount-popover',
            showBackdrop: true
        });

        await this.accountListPopover.present();

        this.accountListPopover.onDidDismiss().then(res => {
            if (res && res.data) {
                this.requestModal.transactions[0].particular = res.data.uniqueName;
                this.requestModal.transactions[0].name = res.data.name;

                this.requestModal.isMultiCurrencyAvailable = (res.data.currency) && (res.data.currency !== this._generalService.activeCompany.baseCurrency);

                if (this.requestModal.isMultiCurrencyAvailable) {
                    const baseCurrencyDetails = this._generalService.currencies.find(f => f.code === res.data.currency);
                    const foreignCurrencyDetails = this._generalService.currencies.find(f => f.code === this._generalService.activeCompany.baseCurrency);

                    this.requestModal.baseCurrencyDetails = {...baseCurrencyDetails};
                    this.requestModal.foreignCurrencyDetails = {...foreignCurrencyDetails};
                }
                this.updateRequestModal();
                this.router.navigate(['pages', 'entry', this.entryType, 'create']);
            } else {
                this.goToHome();
            }
        }).catch(reason => {
            //
        });
    }

    private assignAccountToList() {
        switch (this.entryType) {
            case EntryTypes.sales:
                this.accountList = this.salesAccounts;
                return;
            case EntryTypes.expense:
                this.accountList = this.expensesAccounts;
                return;
            case EntryTypes.deposit:
                this.accountList = this.depositAccounts;
                return;
        }
    }

    private updateRequestModal() {
        this.store.dispatch(new SetEntryAction(this.requestModal));
    }

    ngOnDestroy(): void {
        if (this.addAmountPopover) {
            this.addAmountPopover.dismiss();
        }

        if (this.accountListPopover) {
            this.accountListPopover.dismiss();
        }
    }

    private goToHome() {
        this.store.dispatch(new ResetEntryAction());
        this.router.navigate(['/pages/home']);
    }
}
