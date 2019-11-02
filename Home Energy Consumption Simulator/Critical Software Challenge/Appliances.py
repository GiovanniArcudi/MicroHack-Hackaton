from PIL import Image, ImageDraw, ImageFont
from datetime import datetime


class Appliance(object):
    """Describes a gas or electricity powered appliance"""
    def __init__(self, identifier: str, imageOnPath: str, imageOffPath: str, consumption: float, fuelType: str, coords: tuple):
        self.identifier = identifier
        self.image = {
            "on": Image.open(imageOnPath, mode="r").convert('RGBA'),
            "off": Image.open(imageOffPath, mode="r").convert('RGBA')
        }
        for img in self.image:
            ratio = 100/self.image[img].size[0]
            self.image[img] = self.image[img].resize((100, int(ratio*self.image[img].size[1])))
        self.consumption = consumption
        self.fuelType = fuelType
        self.coords = coords
        self.ontime = 0
        self.switchedOn = None
        self.on = False

    def getImage(self) -> Image.Image:
        image = self.image["on"] if self.on else self.image["off"]
        image = image.crop((0, 0, image.size[0], image.size[1] + 30))
        label = Image.new('RGBA', image.size, (255,255,255,0))
        font = ImageFont.truetype('./Fonts/leelawad.ttf', 12)
        draw = ImageDraw.Draw(label)
        labelText = self.identifier + " (" + ("on)" if self.on else "off)")
        draw.text(((image.size[0] - font.getsize(labelText)[0])/2, (image.size[1] - 25)), labelText, font=font, fill=(0,0,0,255)) 
        finalImage = Image.alpha_composite(image, label)
        return finalImage

    def draw(self, targetImage: Image.Image):
        image = self.getImage()
        targetImage.paste(image, box=self.coords, mask=image)

    def switch(self):
        self.on = not self.on
        if(self.on):
            self.switchedOn = datetime.now()
        else:
            self.ontime = self.ontime + (datetime.now() - self.switchedOn)

    def getCost(self):
        ontime = self.ontime
        if(self.on):
            ontime  = ontime + (datetime.now() - self.switchedOn)

        return self.consumption * ontime


class Refrigerator(Appliance):
    """Refrigerator appliance"""
    def __init__(self, identifier: str, coords: tuple):
        super(Refrigerator, self).__init__(identifier, "./Appliances/Refrigerator On.png", "./Appliances/Refrigerator Off.png", 5, "electricity", coords)

class Kettle(Appliance):
    """Kettle appliance"""
    def __init__(self, identifier: str, coords: tuple):
        super(Kettle, self).__init__(identifier, "./Appliances/Kettle On.png", "./Appliances/Kettle Off.png", 100, "electricity", coords)

class Oven(Appliance):
    """Oven appliance"""
    def __init__(self, identifier: str, coords: tuple):
        super(Oven, self).__init__(identifier, "./Appliances/Oven On.png", "./Appliances/Oven Off.png", 3, "gas", coords)

        
class Lamp(Appliance):
    """Lamp appliance"""
    def __init__(self, identifier: str, coords: tuple):
        super(Lamp, self).__init__(identifier, "./Appliances/Lamp On.png", "./Appliances/Lamp Off.png", 0.5, "electricity", coords)

class Boiler(Appliance):
    """Boiler appliance"""
    def __init__(self, identifier: str, coords: tuple):
        super(Boiler, self).__init__(identifier, "./Appliances/Boiler On.png", "./Appliances/Boiler Off.png", 10, "gas", coords)

class Television(Appliance):
    """Television appliance"""
    def __init__(self, identifier: str, coords: tuple):
        super(Television, self).__init__(identifier, "./Appliances/Television On.png", "./Appliances/Television Off.png", 25, "electricity", coords)

class GamesConsole(Appliance):
    """GamesConsole appliance"""
    def __init__(self, identifier: str, coords: tuple):
        super(GamesConsole, self).__init__(identifier, "./Appliances/GamesConsole On.png", "./Appliances/GamesConsole Off.png", 30, "electricity", coords)

class CookingHub(Appliance):
    """CookingHub appliance"""
    def __init__(self, identifier: str, coords: tuple):
        super(CookingHub, self).__init__(identifier, "./Appliances/CookingHub On.png", "./Appliances/CookingHub Off.png", 6, "gas", coords)

class PC(Appliance):
    """PC appliance"""
    def __init__(self, identifier: str, coords: tuple):
        super(PC, self).__init__(identifier, "./Appliances/PC On.png", "./Appliances/PC Off.png", 60, "electricity", coords)

class StereoSystem(Appliance):
    """StereoSystem appliance"""
    def __init__(self, identifier: str, coords: tuple):
        super(StereoSystem, self).__init__(identifier, "./Appliances/StereoSystem On.png", "./Appliances/StereoSystem Off.png", 15, "electricity", coords)

class Radiator(Appliance):
    """Radiator appliance"""
    def __init__(self, identifier: str, coords: tuple):
        super(Radiator, self).__init__(identifier, "./Appliances/Radiator On.png", "./Appliances/Radiator Off.png", 30, "gas", coords)

