create extension if not exists pgcrypto;

create schema if not exists app;

create type app.currency_code as enum ('PKR', 'USD', 'INR');

create type app.category_type as enum (
  'income',
  'expense',
  'both'
);

create type app.payment_method as enum (
  'cash',
  'bank_transfer',
  'easypaisa',
  'jazzcash',
  'cheque',
  'credit_card',
  'other'
);

create type app.outbox_action as enum (
  'create',
  'update',
  'delete'
);

create type app.outbox_status as enum (
  'pending',
  'processed',
  'failed'
);