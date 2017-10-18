/**
 * How the code is organized in this JavaScript file:
 * > Initialize variables & utility functions
 * > Code for generating plots in step 1 - 4 (refer to the narrative steps)
 * > Initialize all plots
 */

// Utility function from Elias Zamaria
// Referenece: http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var city_name =  ['BANYULE', 'BAYSIDE', 'BOROONDARA', 'BRIMBANK', 'CASEY', 'DAREBIN', 'FRANKSTON', 'GLEN EIRA', 'GREATER DANDENONG', 'HOBSONS BAY', 'HUME', 'KINGSTON', 'KNOX', 'MANNINGHAM', 'MARIBYRNONG', 'MAROONDAH', 'MELBOURNE', 'MONASH', 'MOONEE VALLEY', 'MORELAND', 'NILLUMBIK', 'PORT PHILLIP', 'STONNINGTON', 'WHITEHORSE', 'WHITTLESEA', 'WYNDHAM', 'YARRA', 'YARRA RANGES', 'CARDINIA', 'MELTON'];
city_name = city_name.sort();


// Leaflet Map
var testdata = {};
var credit_open = false;
var suburb_list = [];
var suburb_list_text = '';
var openmap, layer, geojson_city, geojson_suburb;
var suburb_mode = false;

// Choropleth map
function createChoroMap() {
    openmap = L.map('choro', {
        // doubleClickZoom: false,
        // zoomControl: false,
        // scrollWheelZoom: false,
    }).setView([-37.8354, 145.2437], 9);

    // Event on Zoom
    openmap.on('zoomend', onMapZoom);
    
    // Add tile layer
    L.tileLayer('http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=4ed2a3883b4d47538c142623fd66d379', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 18,
    }).addTo(openmap);

    // Custom Legend

    var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 500, 1000, 2000],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + mycolor_suburb(Math.log10(grades[i])) + '"></i> ' +
                numberWithCommas(grades[i]) + (grades[i + 1] ? '&ndash;' + numberWithCommas(grades[i + 1]) + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(openmap);

    geojson_city = L.geoJson(neighborhoods,
    {
        style: openmapStyle,
        onEachFeature: openmapOnEach
    }
    ).addTo(openmap);

    geojson_cityframe = L.geoJson(neighborhoods,
    {
        style: openmapStyle,
        onEachFeature: openmapOnEach
    });

    geojson_suburb = L.geoJson(newgeofinal,
    {
        style: openmapStyle2,
        onEachFeature: openmapOnEach2
    }
    )
}

function openmapOnEach(feature, layer) {
    layer.bindPopup(feature.properties.neighbourhood, {
        closeButton: true,
        autoPan: false
    });
    layer.on({
        mouseover: openmapMouseOver,
        mouseout: openmapMouseOut,
        click: clickMap
    });
}

function openmapOnEach2(feature, layer) {
    layer.bindPopup(feature.properties.suburb, {
        closeButton: true,
        autoPan: false
    });
    layer.on({
        mouseover: openmapMouseOver_suburb,
        mouseout: openmapMouseOut_suburb,
        click: clickMap_suburb
    });
}

var mycolor = chroma.scale(['#F5D76E', '#D35400']).domain([0 , 300]);

var mycolor_suburb = chroma.scale(['#ffff00', '#D35400']).domain([0 , 4]);
var mycolor_city = chroma.scale(['#ffffff', '#0000ff']).domain([1.7 , 3.7]);

// Show highlighted color
function getColor_city(city_name) {
    var c = '#666';

    // for(var i = 0; i < step1data.length; i++) {
    //     if( step1data[i].areanick == featurenick ) {
    //         c = mycolor( Math.floor(Math.log(step1data[i].total)) )
    //         break;
    //     }
    // }

    c = mycolor_city( lv1_choro[city_name].scale );

    return c;
}

function getColor_suburb(sub_postcode) {
    var c = '#666';

    // for(var i = 0; i < step1data.length; i++) {
    //     if( step1data[i].areanick == featurenick ) {
    //         c = mycolor( Math.floor(Math.log(step1data[i].total)) )
    //         break;
    //     }
    // }

    c = mycolor_suburb( lv2_choro[sub_postcode].scale );

    return c;
}

function openmapStyle(feature) {
    return {
        fillColor: getColor_city(feature.properties.neighbourhood),
        weight: 2,
        color: '#000',
        dashArray: '',
        fillOpacity: 0.5
    }
}

function openmapStyle2(feature) {
    return {
        fillColor: getColor_suburb(feature.properties.postcode),
        weight: 1,
        color: '#ccc',
        dashArray: '',
        fillOpacity: 0.8
    }
}

// When hovering on map
function openmapMouseOver(e) {
    if(!suburb_mode) {
        layer = e.target;

        layer.setStyle({
            fillColor: getColor_city(layer.feature.properties.neighbourhood),
            weight: 2,
            color: 'black',
            dashArray: '',
            fillOpacity: 0
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        // Open Popup
        layer.openPopup();
    }
}

function openmapMouseOver_suburb(e) {
    layer = e.target;

    layer.setStyle({
        fillColor: '#BB3C1C',
        weight: 2,
        color: '#000000',
        dashArray: '',
        fillOpacity: 0
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    // Open Popup
    // layer.openPopup();

    // Show Suburb Name
    showSuburbName(e.target.feature.properties.suburb);
}

// Mouse Out
function openmapMouseOut(e) {
    if(!suburb_mode) {
        geojson_city.resetStyle(e.target);
        
        // Close Popup
        layer.closePopup();
    }
}

// Mouse Out
function openmapMouseOut_suburb(e) {
    geojson_suburb.resetStyle(e.target);

    // Close Popup
    layer.closePopup();
}

// When clicking on Map
var clickLv1 = false;
function clickMap(e) {
    clickLv1 = true;

    // Zoom
    // openmap.setView(e.latlng, 11);
    openmap.fitBounds(e.target._bounds);

    $('html, body').animate({
        scrollTop: $("#cityname").offset().top
    }, 1000);

    // Load Clicked Data
    var nname = e.target.feature.properties.neighbourhood;
    showLv2data(nname);
}

// Show LV2 Information
function showLv2data(cityname_or_zipcode) {
    // Show Name
    if(Number.isInteger(cityname_or_zipcode)) {
        // Zipcode
        if(cityname_or_zipcode in postcode_suburb_dict) {
            $('#input_cityname').text(postcode_suburb_dict[cityname_or_zipcode].thisdata.suburb);
        } else {
            $('#input_cityname').text(cityname_or_zipcode);
        }
    } else {
        // City Name
        $('#input_cityname').text(cityname_or_zipcode);
    }

    // Show restaurants and attractions
    var count_res = lv2_res_attr_count[cityname_or_zipcode].sum_restaurants;
    var count_attr = lv2_res_attr_count[cityname_or_zipcode].sum_attractions;
    $('#lv2_res').animateNumber({ number: parseInt(count_res) });
    $('#lv2_attr').animateNumber({ number: parseInt(count_attr) });

    // Show income plot
    if(!(cityname_or_zipcode in lv2_income)) {
        cityname_or_zipcode = '3163';
    }
    var thisincome = lv2_income[cityname_or_zipcode];
    var chart = c3.generate({
        bindto: '#chart_lv2_income',
        data: {
            x: 'x',
            columns: [
                ['x', 'Shared Room', 'Private Room', 'Entire Home/Apt'],
                ['income', parseInt(thisincome['Shared room']), parseInt(thisincome['Private room']), parseInt(thisincome['Entire home/apt'])]
            ],
            type: 'bar'
        },
        transition: {
            duration: 50
        },
        bar: {
            width: {
                ratio: 0.5 // this makes bar width 50% of length between ticks
            }
        },
        axis: {
            x: {
                type: 'category'
            },
            y: {
                min: 0,
                padding: { top: 0, bottom: 0 }
            }
        },
        legend: {
            show: false
        }
    });
    
}

// When click on suburb
function clickMap_suburb(e) {
    openmap.fitBounds(e.target._bounds);
    var subpostcode = e.target.feature.properties.postcode;
    var nname = e.target.feature.properties.neighbourhood;
    showLv2data(subpostcode);
}

// When zoom in and out
function onMapZoom() {
    var zoomlv = openmap.getZoom();

    if(zoomlv < 10) {
        if(suburb_mode) {
            // Change from suburb mode to city mode
            suburb_mode = false;
            openmap.removeLayer(geojson_suburb);
            openmap.removeLayer(geojson_cityframe);
            openmap.addLayer(geojson_city);
            $('#suburb_name').hide();
            clickLv1 = false;

            $('.legend').fadeOut();
        }
        
    } else {
        if(!suburb_mode) {
            // Change from city mode to suburb mode
            suburb_mode = true;
            openmap.removeLayer(geojson_city);
            geojson_cityframe.setStyle({
                fillColor: 'transparent',
                weight: 2,
                color: '#000',
                dashArray: '',
                fillOpacity: 0.5,
                className: 'disable_layer'
            });
            openmap.addLayer(geojson_suburb);    
            openmap.addLayer(geojson_cityframe);

            $('.legend').fadeIn();
        }
    }
}

// Popup Suburb Name
function showSuburbName(suburb_name) {
    $('#suburb_name').text(suburb_name).fadeIn();
}

// Generate Time Series Chart
// e.g. generateTSChart('#chart', data)
function generateTSChart(chart_dom_id, data, chart_title='', x_label='', y_label='') {
    var chart = new ForestD3.Chart(chart_dom_id);
    var f = d3.format(',.2f')
    var fcount = 0;

    var legend_ts = new ForestD3.Legend(d3.select('#legend'));
    chart.ordinal(true).margin({
        left: 60,
        right: 50
    }).xPadding(0).chartLabel(chart_title).xLabel(x_label).yLabel(y_label).yTickFormat(function(d) {
        fcount++;
        if(fcount % 2 == 0) {
            return '';
        } else {
            return f(d);
        }
    }).xTickFormat(function(d) {
        if (d != null) {
            return d3.time.format('%Y-%m')(new Date(d));
        } else {
            return '';
        }
    }).addPlugin(legend_ts);
    chart.data(data).render();

    return chart;
}

// Generate Bar Chart
// x_padding = padding on left and right (can be from 0, 0.5, 1, 1.5) 
function generateBarChart(chart_dom_id, chart_data, chart_title='', x_label='', y_label='', x_padding=0.2) {
    var chart = new ForestD3.Chart(chart_dom_id);
    var f = d3.format(',.2f');
    var fcount = 0;

    var legend_ts = new ForestD3.Legend(d3.select('#legend'));
    chart.xPadding(x_padding).chartLabel(chart_title).xLabel(x_label).yLabel(y_label).yTickFormat(function(d) {
        fcount++;
        if(fcount % 2 == 0) {
            return '';
        } else {
            return f(d);
        }
    }).xTickFormat(function(d) {
        return d
    }).addPlugin(legend_ts);
    chart.data(chart_data).render();

    return chart;
}

// Read LV3 House Price Data File
var lv3_houseprice = {};

// Investment Form Calculation
function calculateInvestment() {
    if(!parseInt($('#input_invest').val())) { alert('Please insert the number more than 0.'); return; }
    // Get inputs
    var input_invest = parseInt($('#input_invest').val()) * 1000;
    var input_city = $('#input_city').val();

    // Find input in the data
    var invest_city = lv3_houseprice[input_city],
    invest_2bed_price = Math.round(parseInt(invest_city.buy_unit_2br_number * 0.78)),
    invest_3bed_price = Math.round(parseInt(invest_city.buy_house_3br_number * 0.78)),
    invest_2bed = (input_invest > invest_2bed_price),
    invest_3bed = (input_invest > invest_3bed_price);

    // Show the results
    var invest_result = '';
    if(invest_2bed) {
        invest_result += '<li><i class="fa fa-check-circle"></i> 2 Bedrooms Apartment</li>';
    } else {
        invest_result += '<li class="disabled-result"><i class="fa fa-times-circle"></i> 2 Bedrooms Apartment</li>';
    }
    if(invest_3bed) {
        invest_result += '<li><i class="fa fa-check-circle"></i> 3 Bedrooms House</li>';
    } else {
        invest_result += '<li class="disabled-result"><i class="fa fa-times-circle"></i> 3 Bedrooms House</li>';
    }
    if(!invest_2bed && !invest_3bed) {
        $('.invest_ans').addClass('invest_list_disable');
    } else {
        $('.invest_ans').removeClass('invest_list_disable');
    }
    $('.invest_list').html('').append($(invest_result));

    $('#chart_invest_hp').html('');
    var chart = c3.generate({
        bindto: '#chart_invest_hp',
        data: {
            columns: [
                ['2 Beds Apartment', invest_2bed_price],
                ['3 Beds House', invest_3bed_price]
            ],
            type: 'bar'
        },
        grid: {
            y: {
                lines: [
                    {value: input_invest, text: 'Your investment', class: 'gridline-red'}
                ]
            }
        },
        transition: {
            duration: 50
        },
        bar: {
            width: {
                ratio: 0.5 // this makes bar width 50% of length between ticks
            }
        }
    });
    chart.unload({
        ids: ['2 Beds Apartment', '3 Beds House']
    });
    chart.load({
        columns: [
            ['2 Beds Apartment', invest_2bed_price],
            ['3 Beds House', invest_3bed_price]
        ],
    });

    // Plot Visitor
    var invest_visitors = lv3_forecast_visitors[input_city];
    var visitors_x = ['x'];
    var visitors_val = ['Minimum no. of visitors'];

    for(var i = 0; i < invest_visitors.length; i++) {
        var thisdata = invest_visitors[i];
        visitors_x.push( thisdata.thisdata.date );
        visitors_val.push( thisdata.thisdata.predVal );
    }

    $('#chart_visitor_ts').html('');
    var chart = c3.generate({
        bindto: '#chart_visitor_ts',
        data: {
            x: 'x',
            columns: [
                visitors_x,
                visitors_val
            ],
            axes: {
                x: 'x'
            }
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%Y-%m-%d'
                }
            },
            y: {
                min: 0
            }
        },
        point: {
            show: false
        },
        regions: [
            {axis: 'x', start: '2017-04-01', end: '2019-03-01'}
        ],
        grid: {
            x: {
                lines: [
                    {value: '2017-04-01', text: 'Forecast'}
                ]
            }
        }
    });
}

// When pressing calculate button in the income form
function calculateIncome() {
    if(!parseInt($('#input_bedrooms').val())) { alert('Please insert the number more than 0.'); return; }
    
    // Get the inputs
    var input_bedrooms = parseInt($('#input_bedrooms').val());
    var input_suburb = $('#input_suburb').val();

    var entire_house = ($('#input_proptype').val() == 'entire') ? 1 : 0;
    var shared_room = ($('#input_proptype').val() == 'shared') ? 1 : 0;
    var private_room = ($('#input_proptype').val() == 'private') ? 1 : 0;

    // Get checkboxes
    var kitchen = $('#kitchen').prop('checked') ? 1 : 0;
    var wifi = $('#wifi').prop('checked') ? 1 : 0;
    var washer = $('#washer').prop('checked') ? 1 : 0;
    var shampoo = $('#shampoo').prop('checked') ? 1 : 0;
    var essentials = $('#essentials').prop('checked') ? 1 : 0;
    var smoke = $('#smoke').prop('checked') ? 1 : 0;
    var tv = $('#tv').prop('checked') ? 1 : 0;
    var aircon = $('#aircon').prop('checked') ? 1 : 0;
    var freepark = $('#freepark').prop('checked') ? 1 : 0;
    var heating = $('#heating').prop('checked') ? 1 : 0;
    
    // Calculate Income
    var income_calculated = (-86.89048352) + (-3.376879586 * 1) + (11.98089982 * 1) +
    (24.73154829 * input_bedrooms) + (0.194069644 * 365) + (-23.42500097 * kitchen) +
    (14.22454559 * wifi) + (-8.703379275 * washer) + (8.579774536 * smoke) +
    (-0.013006863 * essentials) + (-3.658778783 * heating) + (-9.648727128 * tv) +
    (0.692914499 * aircon) + (15.31085753 * shampoo) + (9.899821855 * wifi) +
    (7.335599952 * 1) + (-11.39010967 * 1) + (12.15110805 * 1) +
    (1.327666454 * freepark) + (4.854517886 * 1) + (7.920602219 * 1) +
    (8.448780415 * 1) + (1.993310501 * 1) + (-4.075777609 * 1) + (19.70271827 * 1) +
    (1.26575579 * 1) + (56.10046181 * 2) + (19.94144143 * entire_house) +
    (-15.56935123 * private_room) + (-45.44821755 * shared_room) +
    (0.215505087471 * 2) + 4.143209315;

    $('#invest_output').animateNumber({ number: Math.round(income_calculated) });
    
    // Visualize amenities
    var input_postcode;
    if(!(input_suburb in suburb_postcode_dict)) {
        console.log('The postcode does not exist');
        input_postcode = 3163;
    } else {
        input_postcode = suburb_postcode_dict[input_suburb].thisdata.postcode;
    }
    var amenities = lv4_amenities[input_postcode];
    console.log(amenities);
    $('.income_val_kitchen').text( amenities['kitchen'] || 0);
    $('.income_val_aircon').text( amenities['air conditioning'] || 0);
    $('.income_val_essentials').text( amenities['essentials'] || 0);
    $('.income_val_heating').text( amenities['heating'] || 0);
    $('.income_val_shampoo').text( amenities['shampoo'] || 0);
    $('.income_val_smoke').text( amenities['smoke detector'] || 0);
    $('.income_val_tv').text( amenities['tv'] || 0);
    $('.income_val_washer').text( amenities['washer'] || 0);
    $('.income_val_wifi').text( amenities['wireless internet'] || 0);
    $('.income_val_freepark').text( amenities['free parking on premises'] || 0);
}

// Plot for Lv. 1
function lv1_plot() {
    var chart = c3.generate({
        bindto: '#chart_lv1_income',
        data: {
            x: 'x',
            columns: [
                lv1_income_column1,
                lv1_income_column2
            ],
            types: {
                income: 'area'
            }
            // type: 'bar'
        },
        axis: {
            x: {
                padding: {right: 0.5}
            }
        },
        legend: {
            show: false
        }
    });
}

// Datasets for each step
var lv1_income_column1 = ['x'];
var lv1_income_column2 = ['income'];
var lv3_forecast_visitors = {};

var lv1_choro = {};
var lv2_choro = {};

var lv2_res_attr_count = {};
var lv2_income = {};
var lv4_amenities = {};

var suburb_postcode_dict = {};
var postcode_suburb_dict = {};

// Initialize all plots
$(document).ready(function() {
    // Test: Try to load data
    d3.csv("data/test.csv", function(data) {
        // Transform the data
        for(var i = 0; i < data.length; i++) {
            var thisdata = data[i];
            testdata[thisdata.suburb] = thisdata;
        }
    });

    // Postcode to suburb dictionary
    d3.csv("data/suburb_postcode.csv", function(data) {
        for(var i = 0; i < data.length; i++) {
            var thisdata = data[i];
            suburb_postcode_dict[(thisdata.suburb).toUpperCase()] = { thisdata };
            postcode_suburb_dict[thisdata.postcode] = { thisdata };
        }
    });

    // Load LV.1 Data
    d3.csv("data/lv1_income_year.csv", function(data) {
        for(var i = 0; i < data.length; i++) {
            var thisdata = data[i];
            lv1_income_column1.push(parseInt(thisdata.year));
            lv1_income_column2.push(parseInt(thisdata.income));
        }
        lv1_plot();
    });

    // Load LV.2
    d3.csv("data/lv2_choro_number_of_listing_per_zipcode.csv", function(data) {
        for(var i = 0; i < data.length; i++) {
            var thisdata = data[i];
            lv2_choro[thisdata.zipcode] = thisdata;
        }

        d3.csv("data/lv1_choro_number_of_listing_per_neighbourhood_cleansed.csv", function(data) {
            for(var i = 0; i < data.length; i++) {
                var thisdata = data[i];
                lv1_choro[thisdata.neighbourhood_cleansed] = thisdata;
            }

            createChoroMap();
        });
    });

    // Load LV.2 Restaurants
    d3.csv("data/lv2_city_neighborhood_eat_attractions_all.csv", function(data) {
        for(var i = 0; i < data.length; i++) {
            var thisdata = data[i];
            lv2_res_attr_count[thisdata.neighbourhood_cleansed] = thisdata;
        }
    });
    d3.csv("data/lv2_suburb_res_melb_eat_attractions_all.csv", function(data) {
        for(var i = 0; i < data.length; i++) {
            var thisdata = data[i];
            lv2_res_attr_count[thisdata.zipcode] = thisdata;
        }
    });

    // Load Lv.2 Income
    d3.csv("data/lv2_city_avg_income_per_room_type_per_neighborhood.csv", function(data) {
        for(var i = 0; i < data.length; i++) {
            var thisdata = data[i];
            var cityname = thisdata.neighbourhood_cleansed.toUpperCase();
            if(!(cityname in lv2_income)) {
                lv2_income[cityname] = [];
            }
            lv2_income[cityname][thisdata.room_type] = thisdata.avg_income;
        }
    });

    d3.csv("data/lv2_suburb_zipcode_avg_income_per_room_type_per_zipcode.csv", function(data) {
        for(var i = 0; i < data.length; i++) {
            var thisdata = data[i];
            var cityname = thisdata.zipcode;
            if(!(cityname in lv2_income)) {
                lv2_income[cityname] = [];
            }
            lv2_income[cityname][thisdata.room_type] = thisdata.avg_income;
        }
    });

    // Load LV.3 Data
    d3.csv("data/lv3_houseprice_city.csv", function(data) {
        for(var i = 0; i < data.length; i++) {
            var thisdata = data[i];
            lv3_houseprice[thisdata.city] = thisdata;
        }
    });

    // Load LV.3 Data
    d3.csv("data/lv3_forecast_by_city.csv", function(data) {
        for(var i = 0; i < data.length; i++) {
            var thisdata = data[i];
            var cityname = thisdata.City.toUpperCase();
            if(!(cityname in lv3_forecast_visitors)) {
                lv3_forecast_visitors[cityname] = [];
            }
            lv3_forecast_visitors[cityname].push({thisdata});
        }
    });

    // Load LV.4 Data
    d3.csv("data/lv4_top_ten_amenities.csv", function(data) {
        for(var i = 0; i < data.length; i++) {
            var thisdata = data[i];
            if(!(thisdata.zipcode in lv4_amenities)) {
                lv4_amenities[thisdata.zipcode] = {}
            }
            lv4_amenities[thisdata.zipcode][thisdata.amenities] = thisdata.count;
        }
    });

    // Menu scroll on click
    $('.main-menu a').on('click', function() {
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top
        }, 1000);
    });

    // Toggle Credit
    $('.cpr_about').on('click', function() {
        credit_open = !credit_open;
        $('.credit_box').slideToggle(300, function() {
            // Scroll to credit
            if(credit_open) {
                $('html, body').animate({
                    scrollTop: $(".credit_box h2").offset().top
                }, 1000);
            }
        });
        return false;
    });

    // Populate Suburb List in the form
    for(var i = 0; i < newgeofinal.features.length; i++) {
        var this_subname = newgeofinal.features[i].properties.suburb;
        suburb_list.push(this_subname);
    }
    suburb_list.sort();
    for(var i = 0; i < suburb_list.length; i++) {
        suburb_list_text += '<option value="' + suburb_list[i] + '">' + suburb_list[i] + '</option>';
    }
    $('#input_suburb').append($(suburb_list_text));

    var city_name_text = '';
    for(var i = 0; i < city_name.length; i++) {
        city_name_text += '<option value="' + city_name[i] + '">' + city_name[i] + '</option>';
    }
    $('#input_city').append($(city_name_text));

    // Time Series
    var data_ts = {
        series: {
            label: 'Income',
            values: [
                ['January 2016', 10],
                ['February 2016', 30],
                ['March 2016', 60],
                ['April 2016', 80],
                ['May 2016', 30],
                ['June 2016', 50],
                ['July 2016', 10],
                ['August 2016', 30],
                ['September 2016', 60],
                ['October 2016', 80],
                ['November 2016', 30],
                ['December 2016', 50],
                ['January 2017', 10],
                ['February 2017', 30],
                ['March 2017', 60],
                ['April 2017', 80],
                ['May 2017', 30],
                ['June 2017', 50],
                ['July 2017', 10],
                ['August 2017', 30],
                ['September 2017', 60],
                ['October 2017', 80],
                ['November 2017', 30],
                ['December 2017', 50],
                ['January 2018', 10],
                ['February 2018', 30],
                ['March 2018', 60],
                ['April 2018', 80],
                ['May 2018', 30],
                ['June 2018', 50],
                ['July 2018', 10],
                ['August 2018', 30],
                ['September 2018', 60],
                ['October 2018', 80],
                ['November 2018', 30],
                ['December 2018', 50],
                ['January 2019', 10],
                ['February 2019', 30],
                ['March 2019', 60],
                ['April 2019', 80],
                ['May 2019', 30],
                ['June 2019', 50],
                ['July 2019', 10],
                ['August 2019', 30],
                ['September 2019', 60],
                ['October 2019', 80],
                ['November 2019', 30],
                ['December 2019', 50]
            ],
            type: 'line',
            // area: true,
            color: '#ff0000'
        },
        marker1: {
            label: 'Past Data',
            type: 'marker',
            axis: 'x',
            value: 23
        },
        region1: {
            label: 'Earnings Season',
            type: 'region',
            axis: 'x',
            values: [0, 23]
        }
    };
    var chart2 = generateTSChart('#my-chart2', data_ts, 'Chart Title', 'Year-Month', 'Income', 0);

    // Bar Chart
    var data_bar = {
        series: {
            label: 'Income',
            values: [
                ['1bed A', 10],
                ['2bed A', 30],
                ['3bed A', 60],
                ['Type D', 10],
                ['Type E', 30],
                ['Type F', 45],
            ],
            type: 'bar',
            // area: true,
            color: '#ff0000'
        },
    };
    // var chart1 = generateBarChart('#chart_lv2_income', data_bar, 'Chart Title', '', 'Income');

    // Waypoint Trigger
    var waypoints_cityname = $('#cityname').waypoint(function(direction) {
            if(direction == 'down') {
                if(!clickLv1) {
                    // Zoom Map
                    openmap.fitBounds([
                        [-37.775451, 144.991331],
                        [-37.850667, 144.896981]
                    ]);
                    showLv2data('Melbourne');
                }
            } else {
                // Unzoom Map
                openmap.setView([-37.8354, 145.2437], 9);
            }
        }, {
            offset: 50
    });

    var waypoints_invest = $('#invest_box').waypoint(function(direction) {
        if(direction == 'down') {
            // Show next frame
            $('#frame_invest').addClass('active');
        } else {
            // Show previous frame
            $('#frame_invest').removeClass('active');
        }
    }, {
        offset: 'bottom-in-view'
    });

    var waypoints_income = $('#income_box').waypoint(function(direction) {
        if(direction == 'down') {
            // Show next frame
            $('#frame_income').addClass('active');
            
        } else {
            // Show previous frame
            $('#frame_income').removeClass('active');
            
        }
    }, {
        offset: 'bottom-in-view'
    });

    var waypoints_credit = $('#page_income_box').waypoint(function(direction) {
        if(direction == 'down') {
            // Set to absolute
            $('#frame_income').css({
                'position': 'absolute',
                'top': $(window).scrollTop() + 'px'
            });
            $('#frame_white').show();
        } else {
            // Set to fix
            $('#frame_income').css({
                'position': 'fixed',
                'top': 0
            });
            $('#frame_white').hide();
        }
    }, {
        offset: 'bottom-in-view'
    });

    // Click calculate button
    $('#calculate_invest').on('click', function() {
        calculateInvestment();
        return false;
    });

    // Click calculate income button
    $('#calculate_income').on('click', function() {
        calculateIncome();
        return false;
    });

    // How to style chart
    // (The <style>s for all charts in one screen can be grouped into 1 class, so we can remove them with class in 1 go)
    // $('body').append('<style id="mychart_color">#my-chart .bar:nth-child(3) { fill: rgb(0, 0, 255) !important; }</style>');
    // Remove chart style
    // $('#mychart_color').remove();

}); // End document ready