export const SAMPLE_FORMULA_FULL = `/* +======================================================================+
   |                Copyright (c) 2009 Oracle Corporation                 |
   |                   Redwood Shores, California, USA                    |
   |                        All rights reserved.                          |
   +======================================================================+
 Version   Author     Date          Description
-------  ----------  ---------    ---------------------------
  2      ACHITTEM    27-June-2019     Enh 29952312 - LDG LEVEL VD TO CONTROL OVERTIME SPLIT FUNCTIONALITY
  3      KAJAAGRA    19-MAR-2020      Enh 31035212 - SYNC INPUT VALUES FOR RETRO ELEMENTS
---------------------------------------------------------------------------*/
/***************************************************************************
 $Header:                                                                  *
 * Formula Name : XX_OVERTIME_BASE_TL_EARN_RESULTS                                 *
 * Description  : Return earnings amount null to create run results        *
 * Detail       :                                                          *
 *                                                                         *
 ***************************************************************************/

DEFAULT FOR prorate_start  is '1900/01/01 00:00:00' (date)
DEFAULT FOR prorate_end is '1900/01/01 00:00:00' (date)
DEFAULT FOR ALLOCATED_EARNINGS_REL_TU_BD_TDPTD IS 0
DEFAULT FOR ALLOCATED_HOURS_REL_TU_BD_TDPTD IS 0
DEFAULT FOR ENTRY_CREATOR_TYPE IS 'NA'

INPUTS ARE prorate_start (date),
          prorate_end (date),
          state  (number),
          county (number),
          city   (number)


l_flsa_date='0001/01/01 00:00:00' (date)
l_earned_date='1900/01/01 00:00:00' (date)


l_element_entry_id       = TO_CHAR(GET_CONTEXT(ELEMENT_ENTRY_ID, 0))
LOG_EE_ID='[L'||l_element_entry_id||']'
l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS) Process Start')


 CALL_FORMULA('US_EARN_RESULTS'
    ,prorate_start > 'P_PRORATE_START_DATE'
    ,prorate_end > 'P_PRORATE_END_DATE'
    ,state > 'P_STATE'
    ,county > 'P_COUNTY'
    ,city > 'P_CITY'
    ,amount < 'OUT_AMOUNT' DEFAULT 0
    ,units < 'OUT_HOURS' DEFAULT 0
    ,percentage < 'OUT_PERCENTAGE' DEFAULT 0
    ,l_calc_rate < 'OUT_CALC_RATE' DEFAULT 0
    ,l_multiple < 'OUT_MULTIPLE' DEFAULT 1)

l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)Amount:'||to_char(amount))
l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)Units:'||to_char(units))
l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)Percentage:'||to_char(percentage))
l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)Calculated Rate:'||to_char(l_calc_rate))
l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)Multiple:'||to_char(l_multiple))


CALL_FORMULA('ORA_PAY_ELEMENT_ENTRY_VALUES','SECONDARY_CLASSIFICATION'>'P_BASE_INPUT_VALUE_NAME','TEXT'>'P_DATA_TYPE',l_secondary_classification<'OUT_ELE_ENTRY_VALUE' DEFAULT 'X')


l_dummy =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) l_sec_class: '||l_secondary_classification)
l_dummy =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) state: '||to_char(state))

CALL_FORMULA('US_FLAT_SUM_BONUS_CALCULATIONS',
            'GET_EARN_RESULTS' > 'P_MODE',
             state > 'P_STATE',
            l_secondary_classification > 'P_SECONDARY_CLASSIFICATION' ,
             amount > 'P_AMOUNT' ,
             units > 'P_HOURS' ,
             l_multiple > 'P_MULTIPLE' ,
             l_flat_sum_earnings < 'L_FLAT_SUM_EARNINGS' DEFAULT 0 ,
            l_reg_hrs < 'L_REG_HRS' DEFAULT 0 ,
             l_alloc_earnings < 'L_ALLOC_EARNINGS' DEFAULT 0)


l_dummy =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) l_reg_hrs: '||to_char(l_reg_hrs))

  if(l_secondary_classification='Standard Earnings Premium') THEN
 (
   l_alloc_earnings = ALLOCATED_EARNINGS_REL_TU_BD_TDPTD
   l_alloc_hours = ALLOCATED_HOURS_REL_TU_BD_TDPTD
   l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)Allocated Earnings:'||to_char(l_alloc_earnings))
   l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)Allocated Hours:'||to_char(l_alloc_hours))
 )
 ELSE
 (
   CALL_FORMULA('ORA_HRX_US_EARN_COMMON_OPERATIONS'
    ,'GET_LDG_LEVEL_VD_VALUE' > 'p_mode'
    ,'ORA_HRX_US_EARN_FLSA_SPLIT_PREF' > 'p_vd_name'
    ,flsa_split_preference < 'out_vd_value' DEFAULT 'NOVAL')
  l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)FLSA Split VD Value:' ||flsa_split_preference)
 if flsa_split_preference='Y' then
(
 dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS) DEDUCTION_COMPONENT_BY_EE :'||to_char(DEDUCTION_COMPONENT_BY_EE))
change_contexts(DIR_CARD_COMP_ID = DEDUCTION_COMPONENT_BY_EE)
  (
 change_contexts(PART_NAME = 'ORA_HRX_US_EARN_FLSA_DATE')
(
IF (CALC_DIR_EXISTS() = 'Y') THEN
(
l_flsa_date =  to_date(calc_dir_text_value(0))
)
)
)
l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)l_flsa_date:'||to_char(l_flsa_date))

if(l_flsa_date = '0001/01/01 00:00:00' (date)) THEN
  (
  l_alloc_earnings = amount
  l_alloc_hours = units
 )
 ELSE(
 l_earned_date = GET_CONTEXT(DATE_EARNED, l_earned_date)
 l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)l_earned_date:'||to_char(l_earned_date))
 if(l_earned_date = l_flsa_date) THEN
  (
  l_alloc_earnings = amount
  l_alloc_hours = units
 )
 ELSE (
  l_alloc_earnings = 0
  l_alloc_hours = 0
 )
)
)
ELSE (
  l_alloc_earnings = amount
  l_alloc_hours = units
)

l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)Allocated Earnings:'||to_char(l_alloc_earnings))
l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)Allocated Hours:'||to_char(l_alloc_hours))
)

CALL_FORMULA('ORA_PAY_ELEMENT_ENTRY_VALUES','EXPEDITE'>'P_BASE_INPUT_VALUE_NAME','TEXT'>'P_DATA_TYPE',l_expedite<'OUT_ELE_ENTRY_VALUE' DEFAULT '0')

CALL_FORMULA('ORA_PAY_ELEMENT_ENTRY_VALUES','OVERRIDE_PAYMENT_METHOD'>'P_BASE_INPUT_VALUE_NAME','TEXT'>'P_DATA_TYPE',l_override_payment_method<'OUT_ELE_ENTRY_VALUE' DEFAULT '-1')

CALL_FORMULA('ORA_PAY_ELEMENT_ENTRY_VALUES','OVERRIDE_CHECK_PRINTER'>'P_BASE_INPUT_VALUE_NAME','TEXT'>'P_DATA_TYPE',l_override_check_printer<'OUT_ELE_ENTRY_VALUE' DEFAULT '0')

CALL_FORMULA('ORA_PAY_ELEMENT_ENTRY_VALUES','CREATOR_ID'>'P_BASE_INPUT_VALUE_NAME','NUMBER'>'P_DATA_TYPE',l_creator_id<'OUT_NUM_ELE_ENTRY_VALUE' DEFAULT -1)

CALL_FORMULA('ORA_PAY_ELEMENT_ENTRY_VALUES','CREATER_TYPE'>'P_BASE_INPUT_VALUE_NAME','TEXT'>'P_DATA_TYPE',l_creator_type<'OUT_ELE_ENTRY_VALUE' DEFAULT 'TL')

l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)EXPEDITE:'||l_expedite)
l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)OVERRIDE_PAYMENT_METHOD:'||l_override_payment_method)
l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)OVERRIDE_CHECK_PRINTER:'||l_override_check_printer)
l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)CREATOR_ID:'||to_char(l_creator_id))
l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS)CREATER_TYPE:'||l_creator_type)


/*Start of Exempt Wages Calculation */
l_dummy =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) ProcessStart')

l_effective_date = GET_CONTEXT(EFFECTIVE_DATE,TO_DATE('0001/01/01 00:00:00'))
l_dummy =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) l_effective_date: '||TO_CHAR(l_effective_date))
l_exempt_hrs = 0
l_exempt_wages = 0
l_date_earned = GET_CONTEXT(DATE_EARNED, PAY_EARN_PERIOD_END)
l_log = PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) l_date_earned =  '|| to_char(l_date_earned))


L_CREATOR_TYPE_EE = ENTRY_CREATOR_TYPE
l_dummy =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) ENTRY_CREATOR_TYPE : ' || L_CREATOR_TYPE_EE)


    IF (L_CREATOR_TYPE_EE = 'DIR_COMP') THEN
    (
        l_dir_card_id = DEDUCTION_CARD_BY_EE
        l_dir_card_comp_id = DEDUCTION_COMPONENT_BY_EE
        l_dummy =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) l_dir_card_id: '||TO_CHAR(l_dir_card_id))
        l_dummy =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) l_dir_card_comp_id: '||TO_CHAR(l_dir_card_comp_id))
        CHANGE_CONTEXTS(DEDUCTION_CARD_ID = l_dir_card_id,  DIR_CARD_COMP_ID = l_dir_card_comp_id, EFFECTIVE_DATE = l_date_earned)
        (
                 l_exempt_hours_tc = 0
                CHANGE_CONTEXTS(PART_NAME='ORA_HRX_US_EXEMPT_HOURS_OVER_STAT_LIMIT' )
            (
                IF (CALC_DIR_EXISTS() = 'Y') THEN
                (
                    CALL_FORMULA('CALL_CALC_VALUE',
                                   1 > 'BASE',
                              l_exempt_hours_tc < 'DED_AMOUNT' DEFAULT -1,
                              l_uom  < 'out_uom'   DEFAULT 'ND'
                    )
                    l_log = PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) - l_exempt_hours_tc: ' || to_char(l_exempt_hours_tc) )
                    l_log = PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) - l_uom: ' || l_uom )
                    l_exempt_hrs = l_exempt_hours_tc
                )
            )
                       l_exempt_flag_tc = 'N'
                CHANGE_CONTEXTS(PART_NAME = 'ORA_HRX_US_HOURS_OVER_STAT_LIMIT')
            (
              IF (CALC_DIR_EXISTS() = 'Y') THEN
              (
                    l_exempt_flag_tc = CALC_DIR_TEXT_VALUE(0)
                    l_log = PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS)- Exempt Flag: ' || l_exempt_flag_tc)
              )
              l_log = PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS)- Exempt Flag: ' || l_exempt_flag_tc)
             )
                IF(l_exempt_hrs = 0) THEN
            (
                IF (l_exempt_flag_tc = 'Y' or l_exempt_flag_tc = '1') THEN
                (
                    l_exempt_hrs =  units
                    l_log = PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS)- l_exempt_hrs: ' || TO_CHAR(l_exempt_hrs))
                )
              )

              )
     )
     l_exempt_wages = l_exempt_hrs * l_calc_rate * l_multiple

          CALL_FORMULA('US_WSA_OPERATIONS','GET_CURRENCY_PRECISION' > 'P_MODE'
                 ,l_precision            < 'OUT_PRECISION' DEFAULT 2
                 ,l_extended_precision   < 'OUT_EXTENDED_PRECISION' DEFAULT 5)
    l_log =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) Precision '|| TO_CHAR(l_precision))
    l_log =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) Extended Precision '|| TO_CHAR(l_extended_precision))

    l_exempt_wages = ROUNDUP(l_exempt_wages,l_precision)

         l_dummy =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) l_exempt_hrs :'||to_char(l_exempt_hrs ))
    l_dummy =PAY_INTERNAL_LOG_WRITE('(XX_OVERTIME_BASE_TL_EARN_RESULTS) l_exempt_wages :'||to_char(l_exempt_wages ))
    /*End of Exempt Wages Calculation */


    l_dummy =PAY_INTERNAL_LOG_WRITE(LOG_EE_ID||'(XX_OVERTIME_BASE_TL_EARN_RESULTS) Process End')

IF (l_override_check_printer <> '0' and l_override_payment_method <> '-1') then
   (
            RETURN amount,units,percentage,l_calc_rate,l_multiple,l_alloc_earnings,l_alloc_hours,l_element_entry_id,l_expedite,l_override_payment_method,l_override_check_printer,l_creator_id,l_creator_type,l_exempt_hrs,l_exempt_wages,l_reg_hrs
  )
   ELSE IF (l_override_check_printer <> '0' and l_override_payment_method = '-1') then
   (
            RETURN amount,units,percentage,l_calc_rate,l_multiple,l_alloc_earnings,l_alloc_hours,l_element_entry_id,l_expedite,l_override_check_printer,l_creator_id,l_creator_type,l_exempt_hrs,l_exempt_wages,l_reg_hrs
  )
           ELSE IF (l_override_check_printer = '0' and l_override_payment_method <> '-1') then
   (
            RETURN amount,units,percentage,l_calc_rate,l_multiple,l_alloc_earnings,l_alloc_hours,l_element_entry_id,l_expedite,l_override_payment_method,l_creator_id,l_creator_type,l_exempt_hrs,l_exempt_wages,l_reg_hrs
    )
  ELSE
   (
          RETURN amount,units,percentage,l_calc_rate,l_multiple,l_alloc_earnings,l_alloc_hours,l_element_entry_id,l_expedite,l_creator_id,l_creator_type,l_exempt_hrs,l_exempt_wages,l_reg_hrs
  )`;
