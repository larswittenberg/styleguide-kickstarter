let lottieItems = $All('.js-lottieanimation');


//
// Intersection Observer for Lottie Animations
//
if (lottieItems.length > 0) {

	if ('IntersectionObserver' in window) {
		let observer = new IntersectionObserver((elements) => {

			elements.forEach((element) => {
				const lottie = element.target.querySelector('lottie-player');

				if (element.isIntersecting) {
					if (element.intersectionRatio > 0) {
						lottie.play();
					}
				} else {
					lottie.pause();
					// console.log('pause');
				}
			});
		}, {
			threshold: [0],
		});

		lottieItems.forEach((element) => {
			observer.observe(element);
		});
	} else {
		console.log('No Intersection Observer Support');
		lottieItems.forEach((item) => {
			item.querySelector('lottie-player').setAttribute('autoplay', true);
		});
	}
}


