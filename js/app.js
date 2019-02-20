(function(){

    function handleCities(city) {
        let results = [];

        var city_id = 1;

        const cities = Object.keys(window.cities).forEach(function(kraj){
            Object.keys(window.cities[kraj]).forEach(function(okres){
                Object.keys(window.cities[kraj][okres]).forEach(function(mesto){
                    results.push({
                        id: city_id++,
                        text: window.cities[kraj][okres][mesto][10] + (window.cities[kraj][okres][mesto][13] ? (' (' + okres + ')') : ''),
                        mesto: window.cities[kraj][okres][mesto][10],
                        kraj: kraj,
                        okres: okres,
                        email: window.cities[kraj][okres][mesto][6]
                    })
                })
            })
        });

        if (city) {
            let result;

            city = parseInt(city);

            $(results).filter(function(index, element){
                return element.id === city
            }).each(function(index, element) {
                result = element
            });

            return result
        }

        $(".section-request [name=city]").select2({
            // matcher: matchCustom,
            maximumInputLength: 2,
            data: results,
            placeholder: "napr. Banská Bystrica",
            width: 'resolve'
        });
    }

    $(document).on('focus', '.select2-selection', function (e) {
        if (e.originalEvent)
        {
            $(this).parent().parent().prev().select2("open");
        }
    });

    function formValidation() {
        let valid = true;
        const getInputValue = function(t) {
            return $(".section-request [name=" + t + "]").val()
        };
        const resultWithError = function(selector) {
            $(selector).show();
            valid = false
        };

        $(".validation").hide();
        if (getInputValue("address").length < 5) resultWithError(".validation.address")
        if (getInputValue("name").length < 6) resultWithError(".validation.name")
        if (getInputValue("zip").length < 4) resultWithError(".validation.zip")

        if (!(parseInt(getInputValue("city")) > 0)) // neda sa vycentrovat
        {
            $(".section-request [name=city]").select2('destroy');
            handleCities();
            resultWithError(".validation.city")
        }
        if (getInputValue("ssn").length < 9) resultWithError(".validation.ssn")

        return valid
    }


    function fillTextareaRequest() {
        const getInputValue = function(t) {
            return $(".section-request [name=" + t + "]").val()
        };

        let text = `Žiadosť o vydanie hlasovacieho preukazu pre voľby prezidenta SR v roku 2019.

Podľa §46 zákona č.180/2014 Z.z. o podmienkach výkonu volebného práva a o zmene a doplnení niektorých zákonov žiadam o vydanie hlasovacieho preukazu pre voľby prezidenta Slovenskej republiky v roku 2019.

Moje údaje sú
Meno a priezvisko: $1
Rodné číslo: $2
Ulica a číslo: $3
Mesto: $4
PSČ: $5
Štátna príslušnosť: Slovenská`;

        if (getQuery("whom") === "home") {
            text += `
            
Preukaz prosím zaslať na adresu trvalého pobytu.`
        } else if (getQuery("whom") === "other") {
            text += `
            
Preukaz prosím zaslať na korešpondenčnú adresu: 
$6`
        } else if (getQuery("whom") === "someone") {
            text += `

Hlasovací preukaz prosím vydať nasledovnej splnocnenej osobe priamo v mieste úradu: $7`
        }

        text += `

Žiadam o hlasovací preukaz platný pre dni 16. marca 2019 a 30. marca 2019.

Zároveň žiadam o zaslanie potvrdenia, že ste túto žiadosť obdržali.

Ďakujem.`;

        text = text.replace("$1", getInputValue("name"));
        text = text.replace("$2", getInputValue("ssn"));
        text = text.replace("$3", getInputValue("address"));

        const city = handleCities($(".section-request [name=city]").val());
        text = text.replace("$4", city.mesto);

        text = text.replace("$5", getInputValue("zip"));
        text = text.replace("$6", getInputValue("corresponding-address") + ", " + getInputValue("corresponding-city") + ", " + getInputValue("corresponding-zip") + ", " + getInputValue("corresponding-country"))
        text = text.replace("$7", getInputValue("responsible-name") + ", s číslom OP: " + getInputValue("responsible-id") + ".");

        $("#generated").val(text);
        return text;
    }

    function setQuery(obj) {
        const parsed = Qs.parse(location.search.replace("?", ""));
        Object.keys(obj).forEach(function(key) {
            parsed[key] = obj[key]
        });
        location.search = Qs.stringify(parsed)
    }

    function getQuery(key) {
        const parsed = Qs.parse(location.search.replace("?", ""));
        return parsed[key]
    }

     function handleUriParams() {
        function displaySlide(n) {
            if (n > 0) {
                $("nav").show()
            }

            $(".navigation li").removeClass("selected"); // handle menu items
            $(".navigation li").eq(n).addClass("selected");

            // links after current one are styled
            $(".navigation li").filter(function(i, el) {
                return i > n
            }).addClass("after");

            // links before current one are links
            $(".navigation li").filter(function(i, el) {
                return i <= n
            }).each(function(i) {
                const clickedItem = $(this);
                clickedItem.on("click", function(){ setQuery({ step: i }) })
            });

            $("aside").hide(); // handle displaying sections
            $("aside").eq(n).show();
        }

        const step = getQuery("step");

        if (!step) {
            setQuery({ step: "0" })
        } else if (step === "0") {
            displaySlide(0);
        } else if (step === "1") {
            displaySlide(1);
        } else if (step === "2") {
            displaySlide(2);
        } else if (step === "3") {
            displaySlide(3);
        } else if (step === "4") {
            displaySlide(4);

            if (getQuery("whom") === "someone") {
                $(".responsible-person").show()
            } else if (getQuery("whom") === "other") {
                $(".corresponding-address").show()
                // chcem poslat inam
            } else if (getQuery("whom") === "home") {
                // chcem poslat domov
            } else if (getQuery("whom") === "personally") {
                // chcem si ho prevziat osobne
            }

            if (getQuery("how") === "email") {
                $(".with-address").show()
                // chcem ho poslat emailom
            } else if (getQuery("how") === "list") {
                // chcem ho poslat postou
            }

        } else if (step === "5") {
            displaySlide(5) // nema trvaly pobyt na uzemi SR
        } else if (step === "6") {
            displaySlide(6) // zoberie si to osobne
        }
    }

    function attachAllHandlers() {
        $(".section-info button").first().on("click", function(ev){
            setQuery({ step: "1" })
        });

        $(".section-request [name=name]").on("keyup", function(ev){
            if (ev.currentTarget.value !== "pepek") return;
            $(".section-request [name=name]").val("Milan Rúfus")
            $(".section-request [name=address]").val("Kastielska 3230/7")
            $(".section-request [name=zip]").val("82104")
            $(".section-request [name=ssn]").val("9112318210")
            $(".section-request [name=responsible-name]").val("Jozef Cíger Hronský")
            $(".section-request [name=responsible-id]").val("XX123456")
            $(".section-request [name=corresponding-country]").val("Česká Republika")
            $(".section-request [name=corresponding-zip]").val("11811")
            $(".section-request [name=corresponding-city]").val("Praha")
            $(".section-request [name=corresponding-address]").val("Na Paši")
        });

        $(".section-request-button").on("click", function(){
            if (formValidation() !== true) {
                $("html, body").animate({ scrollTop: 0 }, "slow");
            } else {
                fillTextareaRequest();
                $("html, body").animate({ scrollTop: $(document).height() }, "slow");
                $(".last-steps").show();

                const result = handleCities($(".section-request [name=city]").val());
                $("#last-steps-email").text(result.email);

                $(".section-request-button, .section-request section").hide();
                $("#generated, .last-steps").show();

                let email = "mailto:" + result.email;
                email += "?subject=" + encodeURIComponent("Žiadosť o vydanie hlasovacieho preukazu na voľby prezidenta SR 2019");
                email += "&body=" + encodeURIComponent(fillTextareaRequest());
                $(".email-button").attr("href", email);
            }
        });

        $("#clipboard-request").on("click", function(){
            $("#generated").select();
            document.execCommand("copy");
            $("#clipboard-request+small").show();
        });

        $("#clipboard-email").on("click", function(){
            const $temp = $("<input>");
            $("body").append($temp);
            $temp.val($("#last-steps-email").text()).select();
            document.execCommand("copy");
            $temp.remove();
            $("#clipboard-email+small").show();
        });

        // trvaly pobyt mam
        $("#residence-sk").on("click", function() { setQuery({ residence: "sk", step: "2" }) }); // na slovensku
        $("#residence-out").on("click", function() { setQuery({ residence: "out", step: "5" }) }); // v zahranici

        // prevezmem
        $("#whom-home").on("click", function() { setQuery({ whom: "home", step: "3" }) }); // dorucit domov
        $("#whom-other").on("click", function() { setQuery({ whom: "other", step: "3" }) }); // dorucit inde
        $("#whom-someone").on("click", function() { setQuery({ whom: "someone", step: "4" }) }); // splnomocnenec
        $("#whom-personally").on("click", function() { setQuery({ whom: "personally", step: "6" }) }); // osobne

        // chcem dorucit
        $("#how-email").on("click", function() { setQuery({ how: "email", step: "4" }) }); // emailom
        $("#how-list").on("click", function() { setQuery({ how: "list", step: "4" }) }); // listom

        // chcem dorucit
    }

    handleUriParams();
    attachAllHandlers();
    handleCities();

})();
