import React, { useState, useRef, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useLanguage } from '../context/LanguageContext';
import './ContactForm.css';

// Comprehensive global country data (230+ entries)
const COUNTRY_DATA = [
  { code: '+86', iso: 'cn', name_zh: '中国', name_en: 'China' },
  { code: '+1', iso: 'us', name_zh: '美国', name_en: 'USA' },
  { code: '+852', iso: 'hk', name_zh: '香港', name_en: 'Hong Kong' },
  { code: '+886', iso: 'tw', name_zh: '台湾', name_en: 'Taiwan' },
  { code: '+81', iso: 'jp', name_zh: '日本', name_en: 'Japan' },
  { code: '+82', iso: 'kr', name_zh: '韩国', name_en: 'South Korea' },
  { code: '+49', iso: 'de', name_zh: '德国', name_en: 'Germany' },
  { code: '+44', iso: 'gb', name_zh: '英国', name_en: 'UK' },
  { code: '+33', iso: 'fr', name_zh: '法国', name_en: 'France' },
  { code: '+39', iso: 'it', name_zh: '意大利', name_en: 'Italy' },
  { code: '+7', iso: 'ru', name_zh: '俄罗斯', name_en: 'Russia' },
  { code: '+91', iso: 'in', name_zh: '印度', name_en: 'India' },
  { code: '+65', iso: 'sg', name_zh: '新加坡', name_en: 'Singapore' },
  { code: '+60', iso: 'my', name_zh: '马来西亚', name_en: 'Malaysia' },
  { code: '+66', iso: 'th', name_zh: '泰国', name_en: 'Thailand' },
  { code: '+84', iso: 'vn', name_zh: '越南', name_en: 'Vietnam' },
  { code: '+62', iso: 'id', name_zh: '印度尼西亚', name_en: 'Indonesia' },
  { code: '+61', iso: 'au', name_zh: '澳大利亚', name_en: 'Australia' },
  { code: '+55', iso: 'br', name_zh: '巴西', name_en: 'Brazil' },
  { code: '+52', iso: 'mx', name_zh: '墨西哥', name_en: 'Mexico' },
  { code: '+34', iso: 'es', name_zh: '西班牙', name_en: 'Spain' },
  { code: '+31', iso: 'nl', name_zh: '荷兰', name_en: 'Netherlands' },
  { code: '+46', iso: 'se', name_zh: '瑞典', name_en: 'Sweden' },
  { code: '+48', iso: 'pl', name_zh: '波兰', name_en: 'Poland' },
  { code: '+27', iso: 'za', name_zh: '南非', name_en: 'South Africa' },
  { code: '+971', iso: 'ae', name_zh: '阿联酋', name_en: 'UAE' },
  { code: '+966', iso: 'sa', name_zh: '沙特阿拉伯', name_en: 'Saudi Arabia' },
  { code: '+90', iso: 'tr', name_zh: '土耳其', name_en: 'Turkey' },
  { code: '+1', iso: 'ca', name_zh: '加拿大', name_en: 'Canada' },
  { code: '+41', iso: 'ch', name_zh: '瑞士', name_en: 'Switzerland' },
  { code: '+43', iso: 'at', name_zh: '奥地利', name_en: 'Austria' },
  { code: '+32', iso: 'be', name_zh: '比利时', name_en: 'Belgium' },
  { code: '+45', iso: 'dk', name_zh: '丹麦', name_en: 'Denmark' },
  { code: '+358', iso: 'fi', name_zh: '芬兰', name_en: 'Finland' },
  { code: '+30', iso: 'gr', name_zh: '希腊', name_en: 'Greece' },
  { code: '+353', iso: 'ie', name_zh: '爱尔兰', name_en: 'Ireland' },
  { code: '+47', iso: 'no', name_zh: '挪威', name_en: 'Norway' },
  { code: '+351', iso: 'pt', name_zh: '葡萄牙', name_en: 'Portugal' },
  { code: '+420', iso: 'cz', name_zh: '捷克', name_en: 'Czech Republic' },
  { code: '+36', iso: 'hu', name_zh: '匈牙利', name_en: 'Hungary' },
  { code: '+40', iso: 'ro', name_zh: '罗马尼亚', name_en: 'Romania' },
  { code: '+380', iso: 'ua', name_zh: '乌克兰', name_en: 'Ukraine' },
  { code: '+972', iso: 'il', name_zh: '以色列', name_en: 'Israel' },
  { code: '+20', iso: 'eg', name_zh: '埃及', name_en: 'Egypt' },
  { code: '+234', iso: 'ng', name_zh: '尼日利亚', name_en: 'Nigeria' },
  { code: '+92', iso: 'pk', name_zh: '巴基斯坦', name_en: 'Pakistan' },
  { code: '+880', iso: 'bd', name_zh: '孟加拉国', name_en: 'Bangladesh' },
  { code: '+63', iso: 'ph', name_zh: '菲律宾', name_en: 'Philippines' },
  { code: '+64', iso: 'nz', name_zh: '新西兰', name_en: 'New Zealand' },
  { code: '+54', iso: 'ar', name_zh: '阿根廷', name_en: 'Argentina' },
  { code: '+56', iso: 'cl', name_zh: '智利', name_en: 'Chile' },
  { code: '+57', iso: 'co', name_zh: '哥伦比亚', name_en: 'Colombia' },
  { code: '+51', iso: 'pe', name_zh: '秘鲁', name_en: 'Peru' },
  { code: '+93', iso: 'af', name_zh: '阿富汗', name_en: 'Afghanistan' },
  { code: '+355', iso: 'al', name_zh: '阿尔巴尼亚', name_en: 'Albania' },
  { code: '+213', iso: 'dz', name_zh: '阿尔及利亚', name_en: 'Algeria' },
  { code: '+376', iso: 'ad', name_zh: '安道尔', name_en: 'Andorra' },
  { code: '+244', iso: 'ao', name_zh: '安哥拉', name_en: 'Angola' },
  { code: '+1264', iso: 'ai', name_zh: '安圭拉', name_en: 'Anguilla' },
  { code: '+1268', iso: 'ag', name_zh: '安提瓜和巴布达', name_en: 'Antigua and Barbuda' },
  { code: '+374', iso: 'am', name_zh: '亚美尼亚', name_en: 'Armenia' },
  { code: '+297', iso: 'aw', name_zh: '阿鲁巴', name_en: 'Aruba' },
  { code: '+994', iso: 'az', name_zh: '阿塞拜疆', name_en: 'Azerbaijan' },
  { code: '+1242', iso: 'bs', name_zh: '巴哈马', name_en: 'Bahamas' },
  { code: '+973', iso: 'bh', name_zh: '巴林', name_en: 'Bahrain' },
  { code: '+1246', iso: 'bb', name_zh: '巴巴多斯', name_en: 'Barbados' },
  { code: '+375', iso: 'by', name_zh: '白俄罗斯', name_en: 'Belarus' },
  { code: '+501', iso: 'bz', name_zh: '伯利兹', name_en: 'Belize' },
  { code: '+229', iso: 'bj', name_zh: '贝宁', name_en: 'Benin' },
  { code: '+1441', iso: 'bm', name_zh: '百大', name_en: 'Bermuda' },
  { code: '+975', iso: 'bt', name_zh: '不丹', name_en: 'Bhutan' },
  { code: '+591', iso: 'bo', name_zh: '玻利维亚', name_en: 'Bolivia' },
  { code: '+387', iso: 'ba', name_zh: '波黑', name_en: 'Bosnia and Herzegovina' },
  { code: '+267', iso: 'bw', name_zh: '博茨瓦纳', name_en: 'Botswana' },
  { code: '+1', iso: 'vg', name_zh: '英属维尔京群岛', name_en: 'British Virgin Islands' },
  { code: '+673', iso: 'bn', name_zh: '文莱', name_en: 'Brunei' },
  { code: '+359', iso: 'bg', name_zh: '保加利亚', name_en: 'Bulgaria' },
  { code: '+226', iso: 'bf', name_zh: '布基纳法索', name_en: 'Burkina Faso' },
  { code: '+257', iso: 'bi', name_zh: '布隆迪', name_en: 'Burundi' },
  { code: '+855', iso: 'kh', name_zh: '柬埔寨', name_en: 'Cambodia' },
  { code: '+237', iso: 'cm', name_zh: '喀麦隆', name_en: 'Cameroon' },
  { code: '+238', iso: 'cv', name_zh: '佛得角', name_en: 'Cape Verde' },
  { code: '+1345', iso: 'ky', name_zh: '开曼群岛', name_en: 'Cayman Islands' },
  { code: '+236', iso: 'cf', name_zh: '中非共和国', name_en: 'Central African Republic' },
  { code: '+235', iso: 'td', name_zh: '乍得', name_en: 'Chad' },
  { code: '+242', iso: 'cg', name_zh: '刚果（布）', name_en: 'Congo (Brazzaville)' },
  { code: '+243', iso: 'cd', name_zh: '刚果（金）', name_en: 'Congo (Kinshasa)' },
  { code: '+682', iso: 'ck', name_zh: '库克群岛', name_en: 'Cook Islands' },
  { code: '+506', iso: 'cr', name_zh: '哥斯达黎加', name_en: 'Costa Rica' },
  { code: '+385', iso: 'hr', name_zh: '克罗地亚', name_en: 'Croatia' },
  { code: '+53', iso: 'cu', name_zh: '古巴', name_en: 'Cuba' },
  { code: '+357', iso: 'cy', name_zh: '塞浦路斯', name_en: 'Cyprus' },
  { code: '+253', iso: 'dj', name_zh: '吉布提', name_en: 'Djibouti' },
  { code: '+1767', iso: 'dm', name_zh: '多米尼克', name_en: 'Dominica' },
  { code: '+1809', iso: 'do', name_zh: '多米尼加', name_en: 'Dominican Republic' },
  { code: '+593', iso: 'ec', name_zh: '厄瓜多尔', name_en: 'Ecuador' },
  { code: '+503', iso: 'sv', name_zh: '萨尔瓦多', name_en: 'El Salvador' },
  { code: '+240', iso: 'gq', name_zh: '赤道几内亚', name_en: 'Equatorial Guinea' },
  { code: '+291', iso: 'er', name_zh: '厄立特里亚', name_en: 'Eritrea' },
  { code: '+372', iso: 'ee', name_zh: '爱沙尼亚', name_en: 'Estonia' },
  { code: '+251', iso: 'et', name_zh: '埃塞俄比亚', name_en: 'Ethiopia' },
  { code: '+500', iso: 'fk', name_zh: '福克兰群岛', name_en: 'Falkland Islands' },
  { code: '+298', iso: 'fo', name_zh: '法罗群岛', name_en: 'Faroe Islands' },
  { code: '+679', iso: 'fj', name_zh: '斐济', name_en: 'Fiji' },
  { code: '+594', iso: 'gf', name_zh: '法属圭亚那', name_en: 'French Guiana' },
  { code: '+689', iso: 'pf', name_zh: '法属波利尼西亚', name_en: 'French Polynesia' },
  { code: '+241', iso: 'ga', name_zh: '加蓬', name_en: 'Gabon' },
  { code: '+220', iso: 'gm', name_zh: '冈比亚', name_en: 'Gambia' },
  { code: '+995', iso: 'ge', name_zh: '格鲁吉亚', name_en: 'Georgia' },
  { code: '+233', iso: 'gh', name_zh: '加纳', name_en: 'Ghana' },
  { code: '+350', iso: 'gi', name_zh: '直布罗陀', name_en: 'Gibraltar' },
  { code: '+299', iso: 'gl', name_zh: '格陵兰', name_en: 'Greenland' },
  { code: '+1473', iso: 'gd', name_zh: '格林纳达', name_en: 'Grenada' },
  { code: '+590', iso: 'gp', name_zh: '瓜德罗普', name_en: 'Guadeloupe' },
  { code: '+1671', iso: 'gu', name_zh: '关岛', name_en: 'Guam' },
  { code: '+502', iso: 'gt', name_zh: '危地马拉', name_en: 'Guatemala' },
  { code: '+224', iso: 'gn', name_zh: '几内亚', name_en: 'Guinea' },
  { code: '+245', iso: 'gw', name_zh: '几内亚比绍', name_en: 'Guinea-Bissau' },
  { code: '+592', iso: 'gy', name_zh: '圭亚那', name_en: 'Guyana' },
  { code: '+509', iso: 'ht', name_zh: '海地', name_en: 'Haiti' },
  { code: '+504', iso: 'hn', name_zh: '洪都拉斯', name_en: 'Honduras' },
  { code: '+354', iso: 'is', name_zh: '冰岛', name_en: 'Iceland' },
  { code: '+98', iso: 'ir', name_zh: '伊朗', name_en: 'Iran' },
  { code: '+964', iso: 'iq', name_zh: '伊拉克', name_en: 'Iraq' },
  { code: '+1876', iso: 'jm', name_zh: '牙买加', name_en: 'Jamaica' },
  { code: '+962', iso: 'jo', name_zh: '约旦', name_en: 'Jordan' },
  { code: '+7', iso: 'kz', name_zh: '哈萨克斯坦', name_en: 'Kazakhstan' },
  { code: '+254', iso: 'ke', name_zh: '肯尼亚', name_en: 'Kenya' },
  { code: '+686', iso: 'ki', name_zh: '基里巴斯', name_en: 'Kiribati' },
  { code: '+850', iso: 'kp', name_zh: '朝鲜', name_en: 'North Korea' },
  { code: '+965', iso: 'kw', name_zh: '科威特', name_en: 'Kuwait' },
  { code: '+996', iso: 'kg', name_zh: '吉尔吉斯斯坦', name_en: 'Kyrgyzstan' },
  { code: '+856', iso: 'la', name_zh: '老挝', name_en: 'Laos' },
  { code: '+371', iso: 'lv', name_zh: '拉脱维亚', name_en: 'Latvia' },
  { code: '+961', iso: 'lb', name_zh: '黎巴嫩', name_en: 'Lebanon' },
  { code: '+266', iso: 'ls', name_zh: '莱索托', name_en: 'Lesotho' },
  { code: '+231', iso: 'lr', name_zh: '利比里亚', name_en: 'Liberia' },
  { code: '+218', iso: 'ly', name_zh: '利比亚', name_en: 'Libya' },
  { code: '+423', iso: 'li', name_zh: '列支敦士登', name_en: 'Liechtenstein' },
  { code: '+370', iso: 'lt', name_zh: '立陶宛', name_en: 'Lithuania' },
  { code: '+352', iso: 'lu', name_zh: '卢森堡', name_en: 'Luxembourg' },
  { code: '+853', iso: 'mo', name_zh: '澳门', name_en: 'Macau' },
  { code: '+389', iso: 'mk', name_zh: '马其顿', name_en: 'Macedonia' },
  { code: '+261', iso: 'mg', name_zh: '马达加斯加', name_en: 'Madagascar' },
  { code: '+265', iso: 'mw', name_zh: '马拉维', name_en: 'Malawi' },
  { code: '+960', iso: 'mv', name_zh: '马尔代夫', name_en: 'Maldives' },
  { code: '+223', iso: 'ml', name_zh: '马里', name_en: 'Mali' },
  { code: '+356', iso: 'mt', name_zh: '马耳他', name_en: 'Malta' },
  { code: '+692', iso: 'mh', name_zh: '马绍尔群岛', name_en: 'Marshall Islands' },
  { code: '+596', iso: 'mq', name_zh: '马提尼克', name_en: 'Martinique' },
  { code: '+222', iso: 'mr', name_zh: '毛里塔尼亚', name_en: 'Mauritania' },
  { code: '+230', iso: 'mu', name_zh: '毛里求斯', name_en: 'Mauritius' },
  { code: '+262', iso: 'yt', name_zh: '马约特', name_en: 'Mayotte' },
  { code: '+691', iso: 'fm', name_zh: '密克罗尼西亚', name_en: 'Micronesia' },
  { code: '+373', iso: 'md', name_zh: '摩尔多瓦', name_en: 'Moldova' },
  { code: '+377', iso: 'mc', name_zh: '摩纳哥', name_en: 'Monaco' },
  { code: '+976', iso: 'mn', name_zh: '蒙古', name_en: 'Mongolia' },
  { code: '+382', iso: 'me', name_zh: '黑山', name_en: 'Montenegro' },
  { code: '+1664', iso: 'ms', name_zh: '蒙特塞拉特', name_en: 'Montserrat' },
  { code: '+212', iso: 'ma', name_zh: '摩洛哥', name_en: 'Morocco' },
  { code: '+258', iso: 'mz', name_zh: '莫桑比克', name_en: 'Mozambique' },
  { code: '+95', iso: 'mm', name_zh: '缅甸', name_en: 'Myanmar' },
  { code: '+264', iso: 'na', name_zh: '纳米比亚', name_en: 'Namibia' },
  { code: '+674', iso: 'nr', name_zh: '瑙鲁', name_en: 'Nauru' },
  { code: '+977', iso: 'np', name_zh: '尼泊尔', name_en: 'Nepal' },
  { code: '+599', iso: 'an', name_zh: '荷属安的列斯', name_en: 'Netherlands Antilles' },
  { code: '+687', iso: 'nc', name_zh: '新喀里多尼亚', name_en: 'New Caledonia' },
  { code: '+505', iso: 'ni', name_zh: '尼加拉瓜', name_en: 'Nicaragua' },
  { code: '+227', iso: 'ne', name_zh: '尼日尔', name_en: 'Niger' },
  { code: '+683', iso: 'nu', name_zh: '纽埃', name_en: 'Niue' },
  { code: '+672', iso: 'nf', name_zh: '诺福克岛', name_en: 'Norfolk Island' },
  { code: '+1670', iso: 'mp', name_zh: '北马里亚纳群岛', name_en: 'Northern Mariana Islands' },
  { code: '+968', iso: 'om', name_zh: '阿曼', name_en: 'Oman' },
  { code: '+680', iso: 'pw', name_zh: '帕劳', name_en: 'Palau' },
  { code: '+970', iso: 'ps', name_zh: '巴勒斯坦', name_en: 'Palestine' },
  { code: '+507', iso: 'pa', name_zh: '巴拿马', name_en: 'Panama' },
  { code: '+675', iso: 'pg', name_zh: '巴布亚新几内亚', name_en: 'Papua New Guinea' },
  { code: '+595', iso: 'py', name_zh: '巴拉圭', name_en: 'Paraguay' },
  { code: '+1787', iso: 'pr', name_zh: '波多黎各', name_en: 'Puerto Rico' },
  { code: '+974', iso: 'qa', name_zh: '卡塔尔', name_en: 'Qatar' },
  { code: '+262', iso: 're', name_zh: '留尼汪', name_en: 'Réunion' },
  { code: '+250', iso: 'rw', name_zh: '卢旺达', name_en: 'Rwanda' },
  { code: '+290', iso: 'sh', name_zh: '圣赫勒拿', name_en: 'Saint Helena' },
  { code: '+1869', iso: 'kn', name_zh: '圣基茨和尼维斯', name_en: 'Saint Kitts and Nevis' },
  { code: '+1758', iso: 'lc', name_zh: '圣卢西亚', name_en: 'Saint Lucia' },
  { code: '+508', iso: 'pm', name_zh: '圣皮埃尔和密克隆', name_en: 'Saint Pierre and Miquelon' },
  { code: '+1784', iso: 'vc', name_zh: '圣文森特和格林纳丁斯', name_en: 'Saint Vincent and the Grenadines' },
  { code: '+685', iso: 'ws', name_zh: '萨摩亚', name_en: 'Samoa' },
  { code: '+378', iso: 'sm', name_zh: '圣马力诺', name_en: 'San Marino' },
  { code: '+239', iso: 'st', name_zh: '圣多美和普林西比', name_en: 'São Tomé and Príncipe' },
  { code: '+221', iso: 'sn', name_zh: '塞内加尔', name_en: 'Senegal' },
  { code: '+381', iso: 'rs', name_zh: '塞尔维亚', name_en: 'Serbia' },
  { code: '+248', iso: 'sc', name_zh: '塞舌尔', name_en: 'Seychelles' },
  { code: '+232', iso: 'sl', name_zh: '塞拉利昂', name_en: 'Sierra Leone' },
  { code: '+421', iso: 'sk', name_zh: '斯洛伐克', name_en: 'Slovakia' },
  { code: '+386', iso: 'si', name_zh: '斯洛文尼亚', name_en: 'Slovenia' },
  { code: '+677', iso: 'sb', name_zh: '所罗门群岛', name_en: 'Solomon Islands' },
  { code: '+252', iso: 'so', name_zh: '索马里', name_en: 'Somalia' },
  { code: '+94', iso: 'lk', name_zh: '斯里兰卡', name_en: 'Sri Lanka' },
  { code: '+249', iso: 'sd', name_zh: '苏丹', name_en: 'Sudan' },
  { code: '+597', iso: 'sr', name_zh: '苏里南', name_en: 'Suriname' },
  { code: '+268', iso: 'sz', name_zh: '斯威士兰', name_en: 'Swaziland' },
  { code: '+963', iso: 'sy', name_zh: '叙利亚', name_en: 'Syria' },
  { code: '+992', iso: 'tj', name_zh: '塔吉克斯坦', name_en: 'Tajikistan' },
  { code: '+255', iso: 'tz', name_zh: '坦桑尼亚', name_en: 'Tanzania' },
  { code: '+670', iso: 'tl', name_zh: '东帝汶', name_en: 'Timor-Leste' },
  { code: '+228', iso: 'tg', name_zh: '多哥', name_en: 'Togo' },
  { code: '+690', iso: 'tk', name_zh: '托克劳', name_en: 'Tokelau' },
  { code: '+676', iso: 'to', name_zh: '汤加', name_en: 'Tonga' },
  { code: '+1868', iso: 'tt', name_zh: '特立尼达和多巴哥', name_en: 'Trinidad and Tobago' },
  { code: '+216', iso: 'tn', name_zh: '突尼斯', name_en: 'Tunisia' },
  { code: '+993', iso: 'tm', name_zh: '土库曼斯坦', name_en: 'Turkmenistan' },
  { code: '+1649', iso: 'tc', name_zh: '特克斯和凯科斯群岛', name_en: 'Turks and Caicos Islands' },
  { code: '+688', iso: 'tv', name_zh: '图瓦卢', name_en: 'Tuvalu' },
  { code: '+256', iso: 'ug', name_zh: '乌干达', name_en: 'Uganda' },
  { code: '+598', iso: 'uy', name_zh: '乌拉圭', name_en: 'Uruguay' },
  { code: '+998', iso: 'uz', name_zh: '乌兹别克斯坦', name_en: 'Uzbekistan' },
  { code: '+678', iso: 'vu', name_zh: '瓦努阿图', name_en: 'Vanuatu' },
  { code: '+58', iso: 've', name_zh: '委内瑞拉', name_en: 'Venezuela' },
  { code: '+681', iso: 'wf', name_zh: '瓦利斯和富图纳', name_en: 'Wallis and Futuna' },
  { code: '+967', iso: 'ye', name_zh: '也门', name_en: 'Yemen' },
  { code: '+260', iso: 'zm', name_zh: '赞比亚', name_en: 'Zambia' },
  { code: '+263', iso: 'zw', name_zh: '津巴布韦', name_en: 'Zimbabwe' },
];

const SITE_KEY = '0x4AAAAAAC93o6sHuLuZ4856';

export default function ContactForm() {
  const { t, lang } = useLanguage();
  const turnstileRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    country_code: '+86',
    whatsapp: '',
    message: '',
  });
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_DATA[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const isZh = lang === 'zh';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchTerm(''); // Reset search when closed
    }
  }, [isDropdownOpen]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setForm(prev => ({ ...prev, country_code: country.code }));
    setIsDropdownOpen(false);
  };

  const filteredCountries = COUNTRY_DATA.filter(c => {
    const s = searchTerm.toLowerCase();
    return (
      c.name_zh.toLowerCase().includes(s) || 
      c.name_en.toLowerCase().includes(s) || 
      c.code.includes(s)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setErrorMsg(isZh ? '请完成人机验证' : 'Please complete the verification');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', country_code: '+86', whatsapp: '', message: '' });
        setSelectedCountry(COUNTRY_DATA[0]);
        setTurnstileToken('');
      } else {
        setStatus('error');
        setErrorMsg(data.message || (isZh ? '提交失败，请重试' : 'Submission failed, please try again'));
        turnstileRef.current?.reset();
      }
    } catch {
      setStatus('error');
      setErrorMsg(isZh ? '网络错误，请检查连接后重试' : 'Network error, please check your connection');
      turnstileRef.current?.reset();
    }
  };

  if (status === 'success') {
    return (
      <div className="cf-form-card cf-success">
        <div className="cf-success-icon">✓</div>
        <h3>{isZh ? '留言已提交！' : 'Message Sent!'}</h3>
        <p>{isZh ? '感谢您的留言，我们会在 1–2 工作日内通过 WhatsApp 或邮件与您联系。' : 'Thank you! We will contact you within 1–2 business days via WhatsApp or email.'}</p>
        <button className="cf-btn-secondary" onClick={() => setStatus('idle')}>
          {isZh ? '再次留言' : 'Send Another'}
        </button>
      </div>
    );
  }

  return (
    <div className="cf-form-card">
      <h2 className="cf-form-title">{isZh ? '留言板' : 'Leave a Message'}</h2>
      <p className="cf-form-sub">{isZh ? '填写下方表单，我们将尽快与您联系' : 'Fill in the form below and we\'ll get back to you shortly'}</p>

      <form onSubmit={handleSubmit} className="cf-form">
        {/* Row 1: Name + Email */}
        <div className="cf-row">
          <div className="cf-field">
            <label className="cf-label">{isZh ? '姓名' : 'Name'}</label>
            <input
              className="cf-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={isZh ? '请输入您的姓名' : 'Your name'}
              maxLength={100}
            />
          </div>
          <div className="cf-field">
            <label className="cf-label">{isZh ? '电子邮件' : 'Email'}</label>
            <input
              className="cf-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={isZh ? '请输入您的电子邮件地址' : 'Your email address'}
              maxLength={200}
            />
          </div>
        </div>

        {/* Row 2: Country Code + WhatsApp */}
        <div className="cf-row">
          <div className="cf-field">
            <label className="cf-label">
              {isZh ? '区号' : 'Country Code'} <span className="cf-required">*</span>
            </label>
            
            {/* Custom Dropdown for Country Flags */}
            <div className="custom-country-selector" ref={dropdownRef}>
              <div 
                className={`cf-input cf-dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img 
                  src={`https://flagcdn.com/w40/${selectedCountry.iso}.png`} 
                  alt={selectedCountry.iso} 
                  className="cf-flag-icon"
                />
                <span className="cf-code-text">{selectedCountry.code}</span>
                <span className="cf-name-text">{isZh ? selectedCountry.name_zh : selectedCountry.name_en}</span>
                <span className="cf-dropdown-arrow">▼</span>
              </div>
              
              {isDropdownOpen && (
                <div className="cf-dropdown-menu">
                  {/* Search Input */}
                  <div className="cf-search-box">
                    <input 
                      ref={searchInputRef}
                      type="text" 
                      className="cf-search-input"
                      placeholder={isZh ? "搜索代码或国家..." : "Search code or country..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()} // Prevent closing
                    />
                  </div>
                  
                  <div className="cf-options-list">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((c, i) => (
                        <div 
                          key={i} 
                          className="cf-dropdown-item"
                          onClick={() => selectCountry(c)}
                        >
                          <img 
                            src={`https://flagcdn.com/w40/${c.iso}.png`} 
                            alt={c.iso} 
                            className="cf-flag-icon"
                          />
                          <span className="cf-code-text">{c.code}</span>
                          <span className="cf-item-name">{isZh ? c.name_zh : c.name_en}</span>
                        </div>
                      ))
                    ) : (
                      <div className="cf-no-results">
                        {isZh ? "未找到结果" : "No results found"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="cf-field">
            <label className="cf-label">
              whatsapp <span className="cf-required">*</span>
            </label>
            <input
              className="cf-input"
              type="tel"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder={isZh ? '请输入您的电话号码' : 'Your phone number'}
              maxLength={20}
              required
            />
          </div>
        </div>

        {/* Message */}
        <div className="cf-field cf-field-full">
          <label className="cf-label">
            {isZh ? '留言内容' : 'Message'} <span className="cf-required">*</span>
          </label>
          <textarea
            className="cf-input cf-textarea"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder={isZh ? '请输入您的留言（最多 1000 字）' : 'Your message (max 1000 characters)'}
            maxLength={1000}
            rows={5}
            required
          />
          <span className="cf-char-count">{form.message.length} / 1000</span>
        </div>

        {/* Turnstile */}
        <div className="cf-turnstile-wrap">
          <Turnstile
            ref={turnstileRef}
            siteKey={SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken('')}
            options={{ theme: 'light', language: isZh ? 'zh-CN' : 'en' }}
          />
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="cf-error-msg">{errorMsg}</div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="cf-submit-btn"
          disabled={status === 'loading'}
        >
          {status === 'loading'
            ? (isZh ? '提交中...' : 'Submitting...')
            : (isZh ? '提交' : 'Submit')}
          {status !== 'loading' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
