select custrecord_hdr_exchange_rate as fx from 
customrecord_h_usd_rate
where custrecord_hdr_date <= '4/5/2022'
order by custrecord_hdr_date DESC
fetch first 1 rows only