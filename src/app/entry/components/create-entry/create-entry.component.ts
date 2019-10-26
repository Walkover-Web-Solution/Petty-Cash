import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {EntryModel} from '../../../models/entry.model';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../../store/reducer';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {CreateEntryAction} from '../../../actions/entry/entry.action';
import {SelectAccountComponentComponent} from '../select-account/select-account.component';
import {PopoverController} from '@ionic/angular';
import {IFlattenAccountsResultItem} from '../../../models/account.model';
import {PaymentModeComponent} from '../payment-mode/payment-mode.component';

@Component({
    selector: 'create-entry',
    templateUrl: './create-entry.component.html',
    styleUrls: ['./create-entry.component.scss']
})

export class CreateEntryComponent implements OnInit, OnDestroy {
    public requestModal: EntryModel;
    public salesAccounts: IFlattenAccountsResultItem[] = [];
    public expensesAccounts: IFlattenAccountsResultItem[] = [];
    public depositAccounts: IFlattenAccountsResultItem[] = [];
    public debtorsAccounts: IFlattenAccountsResultItem[] = [];
    public creditorsAccount: IFlattenAccountsResultItem[] = [];

    constructor(private router: Router, private store: Store<AppState>, private popoverCtrl: PopoverController) {
    }

    ngOnInit() {
        this.store.pipe(select(s => s.entry.requestModal), untilDestroyed(this)).subscribe(req => {
            this.requestModal = req;
        });

        this.store.pipe(
            select(s => s.general),
            untilDestroyed(this)
        ).subscribe(res => {
            this.salesAccounts = res.salesAccounts;
            this.expensesAccounts = res.expensesAccounts;
            this.depositAccounts = res.depositAccounts;
            this.debtorsAccounts = res.debtorsAccounts;
            this.creditorsAccount = res.creditorsAccounts;
        });
    }

    goToHome() {
        this.router.navigate(['pages', 'home']);
    }

    createEntry() {
        this.store.dispatch(new CreateEntryAction(this.requestModal));
    }

    async showPaymentMode() {
        const paymentModePopover = await this.popoverCtrl.create({
            componentProps: {
                accountList: [...this.depositAccounts],
                entryType: this.requestModal.entryType
            },
            component: PaymentModeComponent,
            animated: true,
            backdropDismiss: false,
            cssClass: 'select-amount-popover'
        });

        await paymentModePopover.present();

        paymentModePopover.onDidDismiss().then(res => {
            if (res && res.data) {
                //
            } else {
                // this.goToHome();
            }
        }).catch(reason => {
            //
        });
    }

    async showAccountList(type: string) {
        const accountListPopover = await this.popoverCtrl.create({
            componentProps: {
                accountList: [],
                entryType: this.requestModal.entryType
            },
            component: SelectAccountComponentComponent,
            animated: true,
            backdropDismiss: false,
            cssClass: 'select-amount-popover'
        });

        await accountListPopover.present();

        accountListPopover.onDidDismiss().then(res => {
            if (res && res.data) {
                //
            } else {
                this.goToHome();
            }
        }).catch(reason => {
            //
        });
    }

    ngOnDestroy(): void {
    }
}
