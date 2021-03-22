<template>
  <q-page padding>
    <q-card class="input-card">
      <form >
        <div class="row q-mb-md">
          <q-banner class="bg-grey-3 col">
            <template v-slot:avatar>
              <q-icon name="fas fa-scroll" color="primary" />
            </template>
            {{ $t('transactions_list_title') }}
          </q-banner>
        </div>

        <div class="row q-mb-md">
          <q-table
            :data='getTransactionsArray'
            :columns="transactionsColumns"
            row-key="id"
            :visible-columns='visibleColumns'
            hide-bottom
            :loading='getTransactionsLoading'
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>
          </q-table>
        </div>

        <error-row-card :errorList="getTransactionsErrorlist" />
      </form>
    </q-card>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { mapSagaActions } from 'vuex-coolstory';
import ErrorRowCard from 'components/Cards/ErrorRowCard.vue';
import { TRANSACTION_LIST_REQUESTING } from '../store/module-transaction/constants.js';

export default {
  name: 'Transactions',
  components: {
    'error-row-card': ErrorRowCard,
  },
  data() {
    return {
      visibleColumns: ['received_at_dateTime', 'amount_received', 'payment_method', 'transaction_status'],
      transactionsColumns: [
        {
          name: 'id',
          field: 'id',
        },
        {
          name: 'received_at_dateTime',
          label: this.$t('transactions_tableColHeader_date'),
          field: 'received_at_dateTime',
          align: 'left',
          format: val => new Date(val).toLocaleDateString(this.$t('app_locale_browser'), { day: '2-digit', month: '2-digit', year: '2-digit' }),
        },
        {
          name: 'amount_received',
          label: this.$t('transactions_tableColHeader_amount'),
          field: 'amount_received',
          format: (val, row) => parseFloat(val).toLocaleString(this.$t('app_locale_browser'), { style: 'currency', currency: row.currency_received }),
        },
        {
          name: 'payment_method',
          label: this.$t('transactions_tableColHeader_via'),
          field: 'payment_method',
          align: 'left',
        },
        {
          name: 'transaction_status',
          label: this.$t('transactions_tableColHeader_status'),
          field: 'transaction_status',
          align: 'left',
          format: val => this.$t(`transactions_fieldValue_status_${val}`),
        },
      ],
    };
  },
  methods: {
    ...mapActions(['transactionsResetErrorlist']),
    ...mapSagaActions([TRANSACTION_LIST_REQUESTING]),
  },
  computed: {
    ...mapGetters([
      'getTransactionsArray',
      'getTransactionsLoading',
      'getTransactionsErrorlist',
      'getUserToken',
    ]),
  },
  created() {
    this.transactionsResetErrorlist();
    this[TRANSACTION_LIST_REQUESTING]({ token: this.getUserToken });
  },
};
</script>

<style>
  .input-card {
    max-width: 500px;
    margin: 20px auto;
    padding: 16px;
  }
  .error-card {
    width: 100%;
    margin: -6px auto 16px;
  }
  .error-item {
    min-height: 0px;
  }
</style>
