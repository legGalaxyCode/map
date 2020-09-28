geocodeOpt = {
	host: 'https://geocode-maps.yandex.ru/1.x/?',
	apikey: 'apikey=43507c8a-48cf-4e57-aa7d-ab62658f5691',
	format: '&format=json',
	address: '',
	kind: '&kind=metro'
};

async function calcPointB() {
	try {
		let pointB;
		let pointA = 'Москва+Дубосековская+13';
		geocodeOpt.address = `&geocode=${encodeURIComponent(pointA)}`;
		const res = await fetch(geocodeOpt.host+geocodeOpt.apikey+geocodeOpt.format+geocodeOpt.address+geocodeOpt.kind);

		if (res.status >= 400) {
			throw new Error("Bad response");
		}

		const json = await res.json();
		//await console.log(json);
		//await console.log('jsonResponse: ', (json.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos).replace(/\s+/g, ','));
		pointB = await (json.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos).replace(/\s+/g, ',');
		//await console.log(pointB);

		geocodeOpt.address = '&geocode=' + pointB;
		//await console.log(geocodeOpt.address);

		const n_res = await fetch(geocodeOpt.host+geocodeOpt.apikey+geocodeOpt.format+geocodeOpt.address+geocodeOpt.kind);
		//await console.log(geocodeOpt.host+geocodeOpt.apikey+geocodeOpt.format+geocodeOpt.address+geocodeOpt.kind);

		if (n_res.status >= 400) {
			throw new Error("Bad response");
		}

		let name;
		const n_json = await n_res.json();
		//await console.log(n_json); //ok
		//await console.log('n_jsonResponse: ', (n_json.response.GeoObjectCollection.featureMember[2].GeoObject.Point.pos).replace(/\s+/g, ','));
		pointB = await (n_json.response.GeoObjectCollection.featureMember[2].GeoObject.Point.pos).replace(/\s+/g, ',');
		name = await n_json.response.GeoObjectCollection.featureMember[2].GeoObject.name;
		//await console.log(pointB);
		geocodeOpt.address = await '&geocode=' + pointB;

		await init(pointA, name);
	} catch (err) {
		console.error(err);
	}
};

function init(pointA, pointB) {
	//console.log('Init b: ', pointB);
    // Задаём точки мультимаршрута.
    var pointA = "Москва, Дубосековская 13",
    	myGeocoder = ymaps.geocode(pointA, {kind: 'metro'});

    /*myGeocoder.then(
    	function (res) {
    		var nearest = res.geoObjects.get(0);
    		console.log(nearest);
    		var name = nearest.properties.get('name');
    		var coords = nearest.geometry.getCoordinates();
    	})*/
        /**
         * Создаем мультимаршрут.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRoute.xml
         */
    let multiRoute = new ymaps.multiRouter.MultiRoute({
            referencePoints: [
                pointA,
                pointB
            ],
            params: {
                //Тип маршрутизации - пешеходная маршрутизация.
                routingMode: 'pedestrian'
            }
        }, {
            // Автоматически устанавливать границы карты так, чтобы маршрут был виден целиком.
            boundsAutoApply: true
        });
    let lenght, time;
    multiRoute.model.events.add('requestsuccess', async function(pointA) {
    	let activeRoute = await multiRoute.getActiveRoute();

    	length = await activeRoute.properties.get("distance").text;
    	await console.log("Length: " + length);
    	time = await activeRoute.properties.get("duration").text;
    	await console.log("Time: " + time);
    	return [lenght, time];

    	/*let infoRouteButton = await new ymaps.control.Button({
		data: {content: "Длина: " + length + " Время: " + time},
		});

		let myMap = await new ymaps.Map('map', {
			center: pointA,
			zoom: 12,
			controls: [infoRouteButton],
		}, {
			buttonMaxWidth: 400
		});

		await myMap.geoObjects.add(multiRoute);*/
    });
    // Создаем кнопку.
    console.log(length);

	let infoRouteButton = new ymaps.control.Button({
		data: {content: "Длина: " + length + " Время: " + time},
	});

	let myMap = new ymaps.Map('map', {
		center: pointA,
		zoom: 12,
		controls: [infoRouteButton],
	}, {
		buttonMaxWidth: 400
	});

	myMap.geoObjects.add(multiRoute);
    // Создаем карту с добавленной на нее кнопкой.
    /*var myMap = new ymaps.Map('map', {
        center: pointA,
        zoom: 12,
        controls: [infoRouteButton], 
    }, {
    	buttonMaxWidth: 400
    });

    // Добавляем мультимаршрут на карту.
    myMap.geoObjects.add(multiRoute);*/
}

/*async function createButton(len, time, pointA, multiRoute) {
	let infoRouteButton = await new ymaps.control.Button({
		data: {content: "Длина: " + len + " Время: " + time},
	});

	let myMap = await new ymaps.Map('map', {
		center: pointA,
		zoom: 12,
		controls: [infoRouteButton],
	}, {
		buttonMaxWidth: 400
	});

	await myMap.geoObjects.add(multiRoute);
}*/

ymaps.ready(calcPointB);
