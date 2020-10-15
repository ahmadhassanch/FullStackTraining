import math

class Complex:
    def __init__(self, real, img):
        self.real = real
        self.img = img
        
    def add(self, obj):
        self.real = obj.real + self.real
        self.img = obj.img + self.img
        return self

    def polar(self):
        t = math.atan2(self.img, self.real)*180/3.14159
        r = math.sqrt( self.real**2 + self.img**2)
        return (r,t)

    def __rnd(self, x, n):
        x = round(x *10**n)/10**n
        return x
        
    def Print(self):
        r, t = self.polar()
        print(f'Rectangular: ({self.real}, {self.img}), Polar({self.__rnd(r,4)}, {self.__rnd(t,4)})')

c1 = Complex(-1,-1)
c1.Print()
c2 = Complex(2,2)
c1.add(c2)
c1.Print()
