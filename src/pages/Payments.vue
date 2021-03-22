<template>
  <q-page padding>
    <q-card class="input-card">
      <form >
        <div class="row q-mb-md">
          <q-banner class="bg-grey-3 col">
            <template v-slot:avatar>
              <q-icon name="euro_symbol" color="primary" />
            </template>
            {{ $t('payments_paypal_title') }}
          </q-banner>
        </div>

        <div class="row">
          <q-input
            v-model='formDataPayment.amount'
            v-on:keyup='onKeyupFormData("amount")'
            @blur='onBlurAmount'
            :rules="[ val => validateAmount(val)
              || $t('app_std_err_enter_amount_between',
              {min: formatAmount(0.01), max: 100000})]"
            ref="amount"
            lazy-rules
            outlined
            class="col"
            style='max-width: 200px'
            :label='$t("payments_paypal_field_amount_label")'
            stack-label
            input-style='text-align: left'
            prefix='€'
          >
          </q-input>
        </div>

        <div class="row q-mb-md">
          <div class="col-6 text-subtitle2">
            <div>Paypal sandbox email: test@fuchs.computer<br>Password: 12345678</div>
          </div>
        </div>

        <div class="row q-mb-md justify-between">
          <div ref='paypalButton' class='col-4'></div>
        </div>

        <div class="row" v-if="getPaymentMessageList.length">
          <q-card flat bordered class="message-card q-mt-md bg-green-1">
            <q-toolbar class="bg-green-1">
              <q-icon name="message" size="32px" color="green" />
              <q-toolbar-title>{{ $t('backend_message_header') }}</q-toolbar-title>
            </q-toolbar>
            <q-list bordered>
                <q-item
                  v-for="messageText in getPaymentMessageList" :key="messageText"
                  class="q-my-xs message-item"
                >
                  <q-item-section>
                    <q-item-label> {{ messageText }} </q-item-label>
                  </q-item-section>
                </q-item>
            </q-list>
          </q-card>
        </div>

        <error-row-card :errorList="getPaymentErrorList" />
      </form>
    </q-card>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import ErrorRowCard from 'components/Cards/ErrorRowCard.vue';
import { mapSagaActions } from 'vuex-coolstory';
import { m } from '../lib/i18nCustomFormatMessage.js';
import { strLocalizedStringToFloat } from '../lib/strings.js';
import { PAYMENT_POST_NEW_PAYMENT_BACKEND } from '../store/module-payment/constants.js';

export default {
  name: 'Payments',
  components: {
    'error-row-card': ErrorRowCard,
  },
  data() {
    return {
      formDataPayment: {
        amount: this.formatAmount(this.$store.state.payment.amount),
      },
    };
  },
  mounted() {
    const paypalScript = document.createElement('script');
    paypalScript.async = true;
    paypalScript.addEventListener('load', this.onPayPalLoaded);
    paypalScript.setAttribute('src',
      `https://www.paypal.com/sdk/js?client-id=Ac1YkChXM-U7aX4JCG56VbM0I2Vg3PUIjN4qmq9_dJJ7q_ahZ9Iux1TqIUwL_cxnRCW-qx0QajvCj01A&currency=EUR&locale=${m('app_locale_payPal')}`);
    document.head.appendChild(paypalScript);
  },
  methods: {
    formatAmount(amount) {
      return new Intl.NumberFormat(m('app_locale_browser'),
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    },
    onBlurAmount(event) {
      this.formDataPayment.amount = this
        .formatAmount(strLocalizedStringToFloat(event.target.value));
    },
    paypalCallbackTransactionCompleted(details) {
      // post new payment to backend
      this[PAYMENT_POST_NEW_PAYMENT_BACKEND](
        {
          details,
          token: this.getUserToken,
        },
      );

      this.formDataPayment.amount = null;
      this.$refs.amount.resetValidation();
      this.paymentSetmessage([m('payments_paypal_message_transaction_success', {
        amountLocalized: details.purchase_units[0].amount.value,
        senderName: details.payer.name.given_name,
      })]);
    },
    onPayPalLoaded() {
      const paypalButtonsBoundThis = window.paypal.Buttons.bind(this);
      paypalButtonsBoundThis({
        onInit: (data, actions) => {
          actions.disable();
          this.$refs.amount.$el.addEventListener('keyup',
            () => {
              if (this.$refs.amount.validate()) {
                actions.enable();
              } else {
                actions.disable();
              }
            });
        },
        createOrder: (data, actions) => actions.order.create({
          purchase_units: [{
            amount: {
              value: strLocalizedStringToFloat(this.$refs.amount.value),
            },
          }],
        }),
        onApprove: (data, actions) => actions.order.capture()
          .then(details => this.paypalCallbackTransactionCompleted(details)),
      }).render(this.$refs.paypalButton);
    },
    validateAmount(val) {
      let returnValue = false;
      if (val) {
        const floatValue = strLocalizedStringToFloat(val);
        returnValue = (floatValue >= 0.01 && floatValue <= 1000000);
      }
      return returnValue;
    },
    onKeyupFormData(inputName) {
      if (this.getPaymentMessageList.length || this.getPaymentErrorList.length) {
        this.resetPaymentMessageErrorLists();
      }
      if (inputName && inputName === 'amount') {
        this.$refs.amount.validate();
      }
    },
    ...mapActions(['paymentSetmessage', 'resetPaymentMessageErrorLists']),
    ...mapSagaActions([PAYMENT_POST_NEW_PAYMENT_BACKEND]),
  },
  computed: {
    ...mapGetters(['getPaymentMessageList', 'getPaymentErrorList', 'getUserToken']),
  },
};
</script>

<style scoped>
  .input-card {
    max-width: 500px;
    margin: 20px auto;
    padding: 16px;
  }
  .row-submit {
    margin-top: -25px;
  }
  .q-separator {
    margin-top: 16px;
    margin-bottom: 20px
  }
  .message-card {
    width: 100%;
    margin: -6px auto 16px;
  }
</style>
