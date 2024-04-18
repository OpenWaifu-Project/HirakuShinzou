import DefaultLang from "./en";

export default {
	commands: {
		fun: {
			image: {
				disabled: "El módulo de imágenes está deshabilitado en este servidor.",
				disabledChannel: ({ channel }: { channel: string }) =>
					`Los comandos de imagenes solo se pueden usar en <#${channel}>`,
				insufficientTokens: [
					"No tienes suficientes tokens para usar este comando! Puedes obtener más votando en top.gg. <:gawrgurapeek:1122720762399305810>",
					"Luego de votar, obtendras las recompensas automaticamente! https://top.gg/bot/1095572785482444860/vote",
					"Si quieres mas tokens, puedes tambien comprar una membresia... [contact support server](https://discord.gg/wX576wXR6p)",
				].join("\n"),
				insufficientPermissions: "Revisa que tenga los permisos `ENVIAR_MENSAJES` y `ADJUNTAR_ARCHIVOS` en este canal",
				success: ({
					userId,
					tokens,
					position,
					model,
					dimension,
				}: {
					userId: string;
					tokens: number;
					position: number;
					model: string;
					dimension: string;
				}) => {
					const dateFormat = `<t:${Math.floor(Date.now() / 1000)}:R>`;
					const warning =
						model !== "anime" && dimension !== "1024x1024"
							? "El modelo seleccionado solo acepta imágenes cuadradas... la resolución ha sido cambiada"
							: "";

					return [
						`<@${userId}> ¡Tu imagen ha sido añadida a la cola! Te quedan **${tokens}** tokens <a:KannaShake:1122720797971185786>`,
						`> Añadido a cola hace... ${dateFormat} (En la posición ${position})`,
						`${warning}`,
					].join("\n");
				},
				insufficentMembership: [
					"Tu suscripción actual no te permite utilizar este modelo... ¡puedes actualizar tu suscripción en nuestro patreon!",
					"https://www.patreon.com/HirakuShinzou",
				].join("\n"),
				filter: {
					triggered: ({
						flags,
					}: {
						flags: string[];
					}) => {
						return [
							"Ehm... He detectado que la indicación introducida puede no ser apropiada para el canal en el que se encuentra actualmente... <:guraglance:1122720755935883385>",
							"Por favor, confírmame si quieres continuar con esta generación... o ir a un canal más apropiado <:MarisaThinking:1122799984107077683>",
							`> Indicadores de filtro activados: \`${flags
								.map((e, index) => (index + 1 !== flags.length ? `${e},` : e))
								.join(" ")}\``,
						].join("\n");
					},
					denied:
						"Entiendo, he cancelado tu generación y devuelto tus fichas... ¡Estaré esperando la próxima! <:HirakuWink:1180310212444438649>",
					notReplied:
						"Estás tardando demasiado... puedes ir a tomar un café y preguntarme de nuevo más tarde, no me muevo. <a:KannaShake:1122720797971185786>",
					highFilter: "Oe weon que ta tratando de generai gonorrea tiplehijoeputa, llmando al 911",
					noValidChannel: [
						"Parece que el prompt sólo es apropiado para canales marcados como NSFW... por favor,  redirígete a uno",
						"> ¿Eres administrador? Usa `/manage image filter` para desactivar el filtro NSFW en los canales SFW.",
					].join("\n"),
					noValidChannelEmbed:
						"**Los servidores son responsables de lo que los usuarios hagan con el bot, si desactivas este filtro es tu responsabilidad moderar lo que se haga con las imágenes.**",
					filterProblem:
						"No puedo continuar con esta generación ahora mismo... ¡inténtalo más tarde! <:hutaosad:1122720782884274267>",
				},
			},
			img2img: {
				disabled: "El comando de img2img está deshabilitado en este servidor.",
				disabledChannel: ({ channel }: { channel: string }) =>
					`Los comandos de img2img solo se pueden usar en <#${channel}>`,
				fetchError: ({ userId }: { userId: string }) =>
					`No pude generar la imagen... <@${userId}> por favor, inténtalo de nuevo más tarde.`,
				insufficientTokens: [
					"No tienes suficientes tokens para usar este comando! Puedes obtener más votando en top.gg. <:gawrgurapeek:1122720762399305810>",
					"Luego de votar, obtendras las recompensas automaticamente! https://top.gg/bot/1095572785482444860/vote",
					"Si quieres mas tokens, puedes tambien comprar una membresia... [contact support server](https://discord.gg/wX576wXR6p)",
				].join("\n"),
				insufficientPermissions: "Revisa que tenga los permisos `ENVIAR_MENSAJES` y `ADJUNTAR_ARCHIVOS` en este canal",
				success: ({
					userId,
					tokens,
					position,
					model,
					dimension,
				}: {
					userId: string;
					tokens: number;
					position: number;
					model: string;
					dimension: string;
				}) => {
					const dateFormat = `<t:${Math.floor(Date.now() / 1000)}:R>`;
					const warning =
						model !== "anime" && dimension !== "1024x1024"
							? "El modelo seleccionado solo acepta imágenes cuadradas... la resolución ha sido cambiada"
							: "";

					return [
						`<@${userId}> ¡Tu imagen ha sido añadida a la cola! Te quedan **${tokens}** tokens <a:KannaShake:1122720797971185786>`,
						`> Añadido a cola hace... ${dateFormat} (En la posición ${position})`,
						`${warning}`,
					].join("\n");
				},
			},
			ask: {
				noRequiredMembership: "No puedes usar este modelo con tu plan de membresía actual.",
				insufficientTokens: ({ requiredTokens }: { requiredTokens: number }) =>
					`Necesitas ${requiredTokens} tokens para usar este modelo.`,
				responseError: "Uhhh... lo siento pero no pude pensar en una respuesta a eso :BocchiOverload:",
				noResponse: "No hay respuesta",
			},
		},
		info: {
			guide: {
				introduction: [
					{
						title: "Introduction",
						content: [
							"El módulo de generación de imágenes Hiraku es una herramienta potente, pero puede ser un poco confuso de usar para las personas que no han estado expuestas a la generación de imágenes de IA antes",
							"Estos son los conceptos principales que deberías tener para empezar",
							"- Usar etiquetas [safebooru](https://safebooru.donmai.us/posts) (proompting).",
							"- Contenido no deseado",
							"- Mejorar.",
							"- Dimensiones adecuadas para tu imagen.",
							"",
							"**Todos estos puntos se tratarán con más detalle en las siguientes páginas de la guía. Utilice el menú contextual para navegar entre secciones.**",
						],
						image: "https://i.imgur.com/HCvmlOx.png",
					},
				],
				prompting: [
					{
						title: "Uso de etiquetas danbooru",
						content: [
							"El modelo de generación de imágenes se entrenó con etiquetas pertenecientes al sitio web [Danbooru/Safebooru English-based image boards](https://safebooru.donmai.us/posts). Esto significa que toda la generación debe seguir el mismo formato y las mismas etiquetas que se suelen utilizar al describir estas imágenes",
							"En este caso se da el enlace a Safebooru que es la versión SFW del Daaboru, si quieres investigar más búscalo en google",
							"",
							"Es posible que el modelo entienda frases simples, pero lo ideal es utilizar sólo etiquetas. Puedes usar Safebooru/Danbooru para buscar las etiquetas que consideres necesarias",
							"",
							"Buen prompt",
							"```diff",
							"+ 1girl, blue hair, short hair, blue eyes```",
							"Prompt mal construido",
							"```diff",
							"- A girl with short blue hair and blue eyes```",
						],
						image: "https://i.imgur.com/s0OfqeV.png",
					},
					{
						title: "Mejores o peores etiquetas",
						content: [
							"Hay ciertas etiquetas que se pueden considerar mejores a la hora de generar una imagen, aunque dependen mucho del contexto y es recomendable que intentes encontrar tu propio estándar, aquí tienes algunas recomendaciones",
							"",
							"- Utiliza etiquetas populares. Cuanto más usada sea la etiqueta más probable es que el modelo pueda reconocerla correctamente, esto no es una garantía pero si una precaución.",
							"- Especifique el ángulo de la cámara con etiquetas. Por ejemplo, `cowbow shot`",
							"- Experimenta. Hay miles de etiquetas disponibles y aunque muchas pueden devolver buenos resultados, otras simplemente no funcionan en el modelo y tendrás que buscar alternativas para conseguir lo que quieres.",
							"- Especifica el ángulo de cámara con etiquetas",
							"[Lista de categorías de etiquetas](https://safebooru.donmai.us/wiki_pages/tag_groups)",
						],
						image: "https://i.imgur.com/M1TAtfW.png",
					},
					{
						title: "Trabajando con personajes",
						content: [
							"El modelo es capaz de recrear muchos personajes de anime conocidos y no tan conocidos simplemente añadiendo su nombre **(basado en la etiqueta booru)** al prompt",
							"Cuantas más imágenes en booru tenga este personaje, más probabilidades tendrá de generar los detalles correctamente. La forma que recomendamos para hacerlo es con el formato `Nombre_del_personaje (Nombre_de_la_serie)`.",
							"",
							"Ejemplo con Tatsumaki (2.8k~ imágenes) y Nejire Hado (700~ imágenes). Prompts usados para los ejemplos: `Tatsumaki (one-punch man)` y `Hadou Nejire (my hero academia)`",
						],
						image: "https://i.imgur.com/rFpSx9p.png",
					},
					{
						title: "Trabajando con artistas",
						content: [
							"Al igual que con los personajes, el modelo es capaz de imitar el estilo de los artistas que comúnmente publican su arte en sitios como [Safebooru/Danbooru](https://safebooru.donmai.us/posts). Teniendo el mismo concepto de uso que con los personajes",
							"",
							"La forma en que recomendamos implementar estos estilos es mediante el uso de prompt strength (explicado en la página siguiente). Ejemplo: `{{ARTIST}}`",
						],
						image: "https://i.imgur.com/hnOfMSp.png",
					},
					{
						title: "Prompt strength",
						content: [
							"La forma de manejar las fuerzas en el módulo de imagen es usar llaves o corchetes",
							"> {TAG} = Más fuerza",
							"> [TAG] = Menos fuerza",
							"",
							"**Es posible rodear las etiquetas varias veces para hacer que la indicación tenga más o menos peso. Ejemplo: {{1girl}}**",
						],
						image: "https://i.imgur.com/zhhPwWU.png",
					},
					{
						title: "Contenidos no deseados",
						content: [
							"El contenido no deseado es una herramienta muy útil a la hora de generar imágenes, te permite especificar lo que no quieres ver en la imagen generada",
							"Para usarlo sólo tienes que añadir las etiquetas no deseadas dentro de la opción `negative-prompt` del comando slash",
						],
						image: "https://i.imgur.com/1q7tbHm.png",
					},
					{
						title: "Trabajar con etiquetas de plantilla",
						content: [
							"La etiqueta de plantilla es una característica que permite guardar etiquetas específicas en una sola etiqueta, facilitando el uso del comando para generar imágenes",
							"La forma de crear estas etiquetas es con el comando `/util tag-create <prompt>, <tags>`. Siendo <prompt> la etiqueta de plantilla y <tags> las etiquetas que representa.",
							"",
							"Ejemplo. si tenemos una etiqueta de plantilla `hikaru`, que representa las etiquetas <pelo azul, pelo corto, ojos azules, pecho pequeño>, la forma de utilizarla a la hora de generar una imagen sería:",
							"`/fun image %hikaru%`",
						],
						image: "https://i.imgur.com/WNfiPJ6.png",
					},
					{
						title: "SMEA (ANIME MODEL ONLY OPTION)",
						content: [
							"Resumidamente, es una modificación del sampler que permite poder llegar a mejorar la calidad general de la imagen haciendo múltiples pasadas mientras se procesa en la misma, esto mismo puede llevar a ciertas ventajas y problemas.",
							"```diff",
							"+ Mejor calidad de la imagen.",
							"+ Más detalles y arreglo de problemas (como lo pueden ser las manos).",
							"+ Un estilo algo más suave.",
							"* Cambios en el estilo al que quieras llegar",
							"```",
							"**¿Pero entonces... no parece haber mucha perdida al usarlo, debería entonces activarlo?**",
							"Para gustos colores, hay gente que prefiere el estilo normal y otros utilizando SMEA",
						],
						image: "https://i.imgur.com/WTRehSY.png",
					},
				],
			},
			history: {
				noImages: "Aún no has generado ninguna imagen.",
			},
			ping: {
				success: ({ ping }: { ping: number }) => {
					return `El ping actual es \`${ping}\``;
				},
			},
			support: {
				success:
					"Puedes unirte al servidor de soporte aquí: https://discord.gg/wX576wXR6p <:KannaPog:1122720808104644620>",
			},
			tags: {
				noTags: "¡No tienes ninguna etiqueta creada aun!",
			},
		},
		manage: {
			language: {
				success: ({ language }: { language: string }) => `Idioma del servidor actualizado a **${language}**`,
			},
			image: {
				channel: {
					success: ({ channel }: { channel: string }) =>
						`Ahora las imagenes podran ser utilizadas solo en **${channel}**`,
					disabled: "Ahora las imagenes podran ser creados en cualquier canal",
					missingChannel: "Por favor, menciona un canal",
				},
				status: {
					success: ({ status }: { status: string }) => `La generacion de imagenes ahora esta **${status}**`,
				},
				blur: {
					success: ({ status }: { status: string }) => `Blur de las imagnees ahora esta **${status}**`,
				},
				filter: {
					success: ({ status }: { status: string }) => `El filtro ahora esta **${status}**`,
				},
				filterFail: {
					success: ({ status }: { status: string }) =>
						`Forzar la generación en canales SFW aunque falle el filtro: ${status}`,
				},
			},
			chat: {
				reset: {
					success: "El historial del chatbot ha sido reseteado para esta guild",
				},
			},
		},
		membership: {
			profile: {
				lastClaimed: "Última votación reclamada",
				voteStrike: "Racha de votos (actualizado en cada reclamo)",
				imageStats: "Estadísticas de imagen",
				totalImages: "Imágenes totales",
				chatStats: "Estadísticas de chat",
			},
			claim: {
				userMissingInGuild: [
					"No pude encontrarte dentro de mi servidor de soporte... Por favor [únete a mi servidor](https://discord.gg/amZp7dyQeK) antes de usar este comando!",
					"Si ya estás en mi servidor y sigues recibiendo este mensaje... puedes ir a <#1095625314731823135> y reportar este problema! <:zerotwo:1122720774768300042>",
				].join("\n"),
				noMembershipFound: [
					"No pude verificar que tengas una membresía activa... Puedes comprar desde mi [sitio web oficial de BuyMeACoffee](https://www.buymeacoffee.com/app/membership/levels)",
					"Si ya has comprado una suscripción y sigues recibiendo este mensaje... puedes ir a <#1095625314731823135> y reportar este problema! <:zerotwo:1122720774768300042>",
				].join("\n"),
				success: ({ membership, tokens }: { membership: string; tokens: number }) =>
					[
						`¡Tu cuenta ha sido actualizada al plan **${membership}**! Se te ha dado:`,
						`> 1. ${tokens} Tokens de imagen!`,
						"Para ver la información de tu cuenta, usa el comando </membership profile:1196299953035821107>!",
					].join("\n"),
				alreadyClaimed: "Ya has reclamado tu membresía!",
				timeAlready: "Debe esperar al menos 30 días para volver a canjear tu membresía!",
			},
		},
		util: {
			config: {
				success: "¡Tu configuración ha sido actualizada!",
			},
			createTag: {
				successUpdate: "Tu etiqueta ha sido actualizada",
				existingTag: "¡Ya tienes una etiqueta con esa indicación! ¿Desea actualizarla?",
				successCreate: "¡Tu etiqueta ha sido creada!",
				failed: "¡Etiqueta no actualizada!",
			},
			deleteTag: {
				success: "El tag fue borrado correctamente",
				notFound: "El tag no fue encontrado",
			},
		},
	},
	welcomeGuild: {
		message: [
			"¡Hola! Soy **Hiraku**, gracias por haberme invitado a tu servidor. Espero que disfrutes de mi compañía.",
			"",
			"Aca tienes una pequeña lista de comandos que puedes usar:",
			"",
			"</fun image:1176327062060023848> - Genera una imagen con el prompt dado",
			"</fun image2img:1176327062060023848> - Genera una imagen en base a otra imagen con el prompt dado",
			"</fun ask:1176327062060023848> - Pregunta algo a una IA",
			"</info image-guide:1122722096632574044> - Guía mas detallada de como usar el comando /fun image",
			"</info tags:1122722096632574044> - Muestra las etiquetas que has creado",
			"</membership profile:1196299953035821107> - Muestra tu perfil",
			"",
			"Además, puedes hablar conmigo mencionándome y escribiendo tu mensaje: `@Hiraku Shinzou Hola`",
			"",
			"> Si tienes alguna duda, puedes unirte a mi servidor de soporte: https://discord.gg/6AQAeUPTFb",
		],
	},
	imageGenerated: {
		blurWarning: "El blur en este servidor esta activado, por lo que la imagen se ha enviado con spoiler",
		imageReady: "tu imagen ha sido generada",
		error: "No pude generar la imagen... por favor, inténtalo de nuevo más tarde.",
	},
	global: {
		on: "Activado",
		off: "Desactivado",
		none: "Ninguno",
	},
} satisfies typeof DefaultLang;
