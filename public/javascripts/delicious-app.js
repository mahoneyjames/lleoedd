import '../sass/style.scss';

import { $, $$ } from './modules/bling';

import autoComplete from './modules/autoComplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';
import pagePlaces from './modules/pagePlaces';

autoComplete($('#address'), $('#lat'), $('#lng'), $('.googleUrl'),$('.googlePlaceId'),$('#postcode'), $('#name'));
typeAhead($('.search'));
makeMap($('#map'));
const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);

